// src/pages/TriggerEvents.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./TriggerEvents.css";

import TimedEventsConfig, {
  BaseTriggerSettings,
} from "../components/TimedTriggerConfig";

import { ChatFollowersConfig } from "../components/ChatFollowersConfig";
import { ChatBanningConfig } from "../components/ChatBanningConfig";
import { ChatSentimentConfig } from "../components/ChatSentimentConfig";
import { ClickTriggerConfig } from "../components/ClickTriggerConfig";

import { useObsConnection } from "../api/obsData";

// Convert "#RRGGBB" or "#AARRGGBB" to uint32 color OBS expects (AARRGGBB)
function hexToObsColorInt(hex) {
  if (!hex) return 0xffffffff;
  let normalized = hex.replace("#", "");
  if (normalized.length === 6) {
    // assume full alpha if none provided
    normalized = "FF" + normalized;
  }
  if (normalized.length !== 8) {
    normalized = "FFFFFFFF"; // white fallback
  }
  return parseInt(normalized, 16);
}

// --- Timed trigger runtime helpers ---

function msFromUnit(value, unit) {
  const n = Number(value) || 0;
  if (unit === "minutes") return n * 60_000;
  return n * 1_000; // default seconds
}

/**
 * Given the config + runtime state for a timed trigger, decide:
 * - shouldShow: whether the overlay should currently be visible
 * - nextRuntime: updated runtime state (timesShown, lastFiredAt, activeUntil...)
 */
function evaluateTimedTrigger({ base, specific, runtime, now }) {
  const {
    frequencyValue,
    frequencyUnit = "seconds",
    cooldown = 0,
    displayDurationType = "permanent",
    displayDurationValue,
    displayDurationUnit = "seconds",
    maxDisplays,
  } = base || {};

  const { startingTimeMinutes = 0 } = specific || {};

  // Initialize runtime fields
  let {
    timesShown = 0,
    lastFiredAt = null,
    activeUntil = null,
    firstAllowedAt = null,
  } = runtime || {};

  if (!firstAllowedAt) {
    firstAllowedAt =
      now + Number(startingTimeMinutes || 0) * 60_000; // delay after activation
  }

  const maxShows = Number(maxDisplays) || Infinity;
  const freqMs = msFromUnit(frequencyValue || 0, frequencyUnit);
  const cooldownMs = (Number(cooldown) || 0) * 1000;
  const durationMs =
    displayDurationType === "timed"
      ? msFromUnit(displayDurationValue || 0, displayDurationUnit)
      : null;

  // 1. If we already hit the maxDisplays, never show again
  if (timesShown >= maxShows) {
    return {
      shouldShow: false,
      nextRuntime: { timesShown, lastFiredAt, activeUntil, firstAllowedAt },
    };
  }

  // 2. If we haven't reached the initial startingTime yet, don't show
  if (now < firstAllowedAt) {
    return {
      shouldShow: false,
      nextRuntime: { timesShown, lastFiredAt, activeUntil, firstAllowedAt },
    };
  }

  // 3. If overlay is currently active and hasn't expired, keep showing
  if (activeUntil && now < activeUntil) {
    return {
      shouldShow: true,
      nextRuntime: { timesShown, lastFiredAt, activeUntil, firstAllowedAt },
    };
  }

  // 4. Check cooldown and frequency spacing
  if (lastFiredAt != null) {
    const sinceLast = now - lastFiredAt;
    if (sinceLast < cooldownMs || (freqMs > 0 && sinceLast < freqMs)) {
      // Cooldown or frequency window not satisfied
      return {
        shouldShow: false,
        nextRuntime: { timesShown, lastFiredAt, activeUntil: null, firstAllowedAt },
      };
    }
  }

  // 5. Conditions satisfied → fire a new display now
  const newTimesShown = timesShown + 1;
  const newLastFiredAt = now;
  const newActiveUntil =
    displayDurationType === "timed" && durationMs > 0
      ? now + durationMs
      : null; // permanent or no duration

  return {
    shouldShow: true,
    nextRuntime: {
      timesShown: newTimesShown,
      lastFiredAt: newLastFiredAt,
      activeUntil: newActiveUntil,
      firstAllowedAt,
    },
  };
}


// All trigger types available in the dropdown
const TRIGGER_TYPES = [
  { id: "timed", label: "Timed Events" },
  { id: "click", label: "When I Am Clicked" },
  { id: "followers", label: "Chat Followers" },
  { id: "banning", label: "Chat Banning" },
  { id: "sentiment", label: "Chat Sentiment" },
];

function TriggerEventsPage({ registerDoneHandler }) {
  const location = useLocation();

  // If a hotkey opened this page, App may send { state: { initialTrigger: "timed" | ... } }
  const initialTriggerFromNav = location.state?.initialTrigger || null;

  const [selectedTrigger, setSelectedTrigger] = useState(
    initialTriggerFromNav || "timed"
  );
  const [step, setStep] = useState("config"); // "config" | "overlays"
  const [errorMsg, setErrorMsg] = useState("");

  // use the shared OBS connection
  const {
    status, // data type: 'disconnected' | 'connecting' | 'connected'
    error: obsError, // data type: Error | null
    getScenes: obsGetScenes, // function
    createScene, // function
    createColorSource, // function
  } = useObsConnection();

  // OBS scenes and selection
  const [scenes, setScenes] = useState([]);
  const [selectedSceneName, setSelectedSceneName] = useState("");
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);

  // Overlay selection (color tile)
  const [selectedOverlayColor, setSelectedOverlayColor] = useState(null);

  // Shared base settings per trigger
  const [baseConfigs, setBaseConfigs] = useState({
    timed: {},
    click: {},
    followers: {},
    banning: {},
    sentiment: {},
  });

  // Trigger-specific settings per trigger
  const [specificConfigs, setSpecificConfigs] = useState({
    timed: {},
    click: {},
    followers: {},
    banning: {},
    sentiment: {},
  });

  // Saved trigger definitions (persisted to localStorage)
  const [savedTriggers, setSavedTriggers] = useState(() => {
    try {
      const raw = window.localStorage.getItem("mainstream-triggers");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Load scenes from the shared OBS connection
  useEffect(() => {
    async function loadScenesFromObs() {
      // Not connected yet; show nothing or a hint
      if (status !== "connected") {
        setScenes([]);
        setSelectedSceneName("");
        return;
      }

      try {
        setIsLoadingScenes(true);
        setErrorMsg("");

        const sceneData = await obsGetScenes();
        const obsScenes = sceneData.scenes || [];
        setScenes(obsScenes);

        const initialScene =
          sceneData.currentProgramSceneName ||
          (obsScenes[0] && obsScenes[0].sceneName) ||
          "";
        setSelectedSceneName(initialScene);
      } catch (err) {
        console.error(err);
        setErrorMsg(
          err.message || "Failed to load OBS scenes from browser connection."
        );
      } finally {
        setIsLoadingScenes(false);
      }
    }

    loadScenesFromObs();
  }, [status, obsGetScenes]);

  // Persist triggers
  useEffect(() => {
    try {
      window.localStorage.setItem(
        "mainstream-triggers",
        JSON.stringify(savedTriggers)
      );
    } catch (e) {
      console.error("Failed to persist triggers", e);
    }
  }, [savedTriggers]);

  // --- overlay selection & creation ---

  // Just select an overlay color (no OBS calls yet)
  const handleOverlaySelect = (color) => {
    setSelectedOverlayColor(color);
    setErrorMsg("");
  };

  // Called when the user clicks "Done" (or when hotkey requests it)
  const handleCreateTriggerWithOverlay = async () => {
    setErrorMsg("");

    if (!selectedOverlayColor) {
      setErrorMsg("Please select an overlay style first.");
      return;
    }

    if (status !== "connected") {
      setErrorMsg("Connect to OBS first on the OBS page.");
      return;
    }

    if (!selectedSceneName) {
      setErrorMsg(
        "Please select a scene (or create a new one) before adding an overlay."
      );
      return;
    }

    const sceneName = selectedSceneName;
    const color = selectedOverlayColor;
    const sourceName = `Trigger-${selectedTrigger}-${Date.now()}`;

    try {
      await createColorSource(sceneName, sourceName, hexToObsColorInt(color));

    const newTrigger = {
      id: Date.now(),
      triggerType: selectedTrigger,
      base: baseConfigs[selectedTrigger] ?? {},
      specific: specificConfigs[selectedTrigger] ?? {},
      overlay: {
        color,
        sceneName,
        sourceName,
      },
      createdAt: Date.now(), // used as "go live" time for the scheduler
    };


      setSavedTriggers((prev) => [...prev, newTrigger]);
      alert("Overlay created in OBS and trigger configuration saved!");

      // Optionally reset overlay selection
      setSelectedOverlayColor(null);
      // Optionally go back to config
      // setStep("config");
    } catch (err) {
      console.error("Failed to create OBS overlay:", err);
      setErrorMsg(
        err?.message || "Failed to create OBS overlay for this trigger."
      );
    }
  };

  // --- Register with App: let hotkeys "click" Done ---
  useEffect(() => {
    if (!registerDoneHandler) return;

    // App will call this with a triggerType string (or null)
    const handlerFromApp = (triggerTypeFromHotkey) => {
      // Only press Done if we're on the overlay step
      if (step !== "overlays") {
        console.log(
          "Hotkey requested Done, but TriggerEvents is not on overlays step."
        );
        return;
      }

      // If hotkey specified a trigger type, it must match the currently selected trigger
      if (
        triggerTypeFromHotkey &&
        triggerTypeFromHotkey !== selectedTrigger
      ) {
        console.log(
          "Hotkey requested Done for trigger type",
          triggerTypeFromHotkey,
          "but current selectedTrigger is",
          selectedTrigger,
          "- ignoring."
        );
        return;
      }

      // Otherwise, pretend the user clicked Done
      console.log(
        "Hotkey matched current trigger type; invoking Done for",
        selectedTrigger
      );
      handleCreateTriggerWithOverlay();
    };

    registerDoneHandler(handlerFromApp);
  }, [
    registerDoneHandler,
    step,
    selectedTrigger,
    selectedOverlayColor,
    selectedSceneName,
    status,
  ]);

  // --- OBS scene handlers ---

  const handleCreateScene = async () => {
    const name = window.prompt("New scene name?");
    if (!name) return;

    try {
      setErrorMsg("");
      await createScene(name);

      const data = await obsGetScenes();
      const obsScenes = data.scenes || [];
      setScenes(obsScenes);
      setSelectedSceneName(name);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create new scene.");
    }
  };

  const handleSceneChange = (event) => {
    setSelectedSceneName(event.target.value);
  };

  // --- helpers for updating configs ---

  const updateBaseConfig = (id, newSettings) => {
    setBaseConfigs((prev) => ({ ...prev, [id]: newSettings }));
  };

  const updateSpecificConfig = (id, newSettings) => {
    setSpecificConfigs((prev) => ({ ...prev, [id]: newSettings }));
  };

  // --- UI handlers ---

  const handleTriggerChange = (event) => {
    const value = event.target.value;
    setSelectedTrigger(value);
    setStep("config");
    setErrorMsg("");
    setSelectedOverlayColor(null);
  };

  const handleBackToConfig = () => {
    setStep("config");
    setErrorMsg("");
    setSelectedOverlayColor(null);
  };

  const goToOverlays = () => {
    setStep("overlays");
    setErrorMsg("");
  };

  // --- render active trigger config ---

  const renderTriggerConfig = () => {
    const base = baseConfigs[selectedTrigger] ?? {};
    const specific = specificConfigs[selectedTrigger] ?? {};

    switch (selectedTrigger) {
      case "timed":
        return (
          <TimedEventsConfig
            baseSettings={base}
            onBaseSettingsChange={(settings) =>
              updateBaseConfig("timed", settings)
            }
            specificSettings={specific}
            onSpecificChange={(settings) =>
              updateSpecificConfig("timed", settings)
            }
            onContinue={goToOverlays}
            setError={setErrorMsg}
          />
        );

      case "click":
        return (
          <ClickTriggerConfig
            baseSettings={base}
            onBaseSettingsChange={(settings) =>
              updateBaseConfig("click", settings)
            }
            specificSettings={specific}
            onSpecificChange={(settings) =>
              updateSpecificConfig("click", settings)
            }
            onContinue={goToOverlays}
            setError={setErrorMsg}
          />
        );

      case "followers":
        return (
          <ChatFollowersConfig
            baseSettings={base}
            onBaseSettingsChange={(settings) =>
              updateBaseConfig("followers", settings)
            }
            specificSettings={specific}
            onSpecificChange={(settings) =>
              updateSpecificConfig("followers", settings)
            }
            onContinue={goToOverlays}
            setError={setErrorMsg}
          />
        );

      case "banning":
        return (
          <ChatBanningConfig
            baseSettings={base}
            onBaseSettingsChange={(settings) =>
              updateBaseConfig("banning", settings)
            }
            specificSettings={specific}
            onSpecificChange={(settings) =>
              updateSpecificConfig("banning", settings)
            }
            onContinue={goToOverlays}
            setError={setErrorMsg}
          />
        );

      case "sentiment":
        return (
          <ChatSentimentConfig
            baseSettings={base}
            onBaseSettingsChange={(settings) =>
              updateBaseConfig("sentiment", settings)
            }
            specificSettings={specific}
            onSpecificChange={(settings) =>
              updateSpecificConfig("sentiment", settings)
            }
            onContinue={goToOverlays}
            setError={setErrorMsg}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="trigger-events-container">
      <div className="trigger-events-content">
        <header className="trigger-header">
          <h1>Trigger Events</h1>
          <p>
            Create automated events that react to your stream: timers, clicks on
            screen, follower milestones, chat moderation, and sentiment-based
            overlays.
          </p>
        </header>

        <div className="trigger-layout">
          {/* Left side: trigger type select */}
          <aside className="trigger-sidebar">
            <label htmlFor="trigger-type">Trigger type</label>
            <select
              id="trigger-type"
              value={selectedTrigger}
              onChange={handleTriggerChange}
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>

            {status !== "connected" && (
              <p className="trigger-status-hint">
                OBS not connected. Go to the OBS page and connect first.
              </p>
            )}
          </aside>

          {/* Right side: config or overlay selection */}
          <section className="trigger-main">
            {errorMsg && <div className="trigger-error">{errorMsg}</div>}
            {obsError && !errorMsg && (
              <div className="trigger-error">
                OBS error: {obsError.message || String(obsError)}
              </div>
            )}

            {step === "config" ? (
              renderTriggerConfig()
            ) : (
              <OverlayGrid
                onBack={handleBackToConfig}
                onOverlaySelect={handleOverlaySelect}
                selectedOverlayColor={selectedOverlayColor}
                onDone={handleCreateTriggerWithOverlay}
                scenes={scenes}
                selectedSceneName={selectedSceneName}
                onSceneChange={handleSceneChange}
                onCreateScene={handleCreateScene}
                isLoadingScenes={isLoadingScenes}
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 2: overlay selection grid + scene selection.
 */
function OverlayGrid({
  onBack,
  onOverlaySelect,
  selectedOverlayColor,
  onDone,
  scenes,
  selectedSceneName,
  onSceneChange,
  onCreateScene,
  isLoadingScenes,
}) {
  const dummyOverlays = [
    "#e57373",
    "#64b5f6",
    "#81c784",
    "#ffb74d",
    "#ba68c8",
    "#4db6ac",
  ];

  return (
    <div className="trigger-card">
      <h2>Choose Scene & Overlay</h2>
      <p>
        Pick which OBS scene this overlay should be added to, then choose an
        overlay style.
      </p>

      {/* Scene selection (mirrors ObsPage’s scene picker) */}
      <div className="scene-selector">
        <label htmlFor="overlay-scene">Scene</label>
        {isLoadingScenes ? (
          <div>Loading scenes from OBS…</div>
        ) : scenes && scenes.length > 0 ? (
          <div className="scene-row">
            <select
              id="overlay-scene"
              value={selectedSceneName || ""}
              onChange={onSceneChange}
            >
              {scenes.map((scene) => (
                <option key={scene.sceneName} value={scene.sceneName}>
                  {scene.sceneName}
                </option>
              ))}
            </select>
            <button type="button" onClick={onCreateScene}>
              + New scene
            </button>
          </div>
        ) : (
          <div className="scene-row">
            <span>No scenes found.</span>
            <button type="button" onClick={onCreateScene}>
              + Create first scene
            </button>
          </div>
        )}
      </div>

      {/* Overlay grid */}
      <div className="overlay-grid">
        {dummyOverlays.map((color, index) => {
          const isSelected = color === selectedOverlayColor;
          return (
            <button
              key={index}
              type="button"
              className={`overlay-tile ${
                isSelected ? "overlay-tile-selected" : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onOverlaySelect?.(color)}
            >
              Overlay {index + 1}
            </button>
          );
        })}
      </div>

      <div className="trigger-actions">
        <button type="button" onClick={onBack}>
          Back to configuration
        </button>
        <button
          type="button"
          className="trigger-done-button"
          onClick={onDone}
          disabled={!selectedOverlayColor}
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default TriggerEventsPage;
