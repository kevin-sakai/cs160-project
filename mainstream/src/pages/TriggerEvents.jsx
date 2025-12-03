// src/pages/TriggerEvents.jsx
import React, { useState, useEffect } from "react";
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

// All trigger types available in the dropdown
const TRIGGER_TYPES = [
  { id: "timed", label: "Timed Events" },
  { id: "click", label: "When I Am Clicked" },
  { id: "followers", label: "Chat Followers" },
  { id: "banning", label: "Chat Banning" },
  { id: "sentiment", label: "Chat Sentiment" },
];

function TriggerEventsPage() {
  const [selectedTrigger, setSelectedTrigger] = useState("timed");
  const [step, setStep] = useState("config"); // "config" | "overlays"
  const [errorMsg, setErrorMsg] = useState("");

  // use the shared OBS connection
  const {
    status,
    error: obsError,
    getScenes: obsGetScenes,
    createScene,
    createColorSource,
  } = useObsConnection();

  // OBS scenes and selection
  const [scenes, setScenes] = useState([]);
  const [selectedSceneName, setSelectedSceneName] = useState("");
  const [isLoadingScenes, setIsLoadingScenes] = useState(false);

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

  // --- helpers for overlay creation ---

  const handleChooseOverlay = async (color) => {
    setErrorMsg("");

    if (status !== "connected") {
      setErrorMsg("Connect to OBS first on the OBS page.");
      return;
    }

    if (!selectedSceneName) {
      setErrorMsg(
        "Please select a scene (or create a new one) before choosing an overlay."
      );
      return;
    }

    const sceneName = selectedSceneName;
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
      };

      setSavedTriggers((prev) => [...prev, newTrigger]);
      alert("Overlay created in OBS and trigger configuration saved!");
    } catch (err) {
      console.error("Failed to create OBS overlay:", err);
      setErrorMsg(
        err?.message || "Failed to create OBS overlay for this trigger."
      );
    }
  };

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
  };

  const handleBackToConfig = () => {
    setStep("config");
    setErrorMsg("");
  };

  const goToOverlays = () => {
    setStep("overlays");
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
                onChooseOverlay={handleChooseOverlay}
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
  onChooseOverlay,
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
        {dummyOverlays.map((color, index) => (
          <button
            key={index}
            type="button"
            className="overlay-tile"
            style={{ backgroundColor: color }}
            onClick={() => onChooseOverlay?.(color)}
          >
            Overlay {index + 1}
          </button>
        ))}
      </div>

      <div className="trigger-actions">
        <button type="button" onClick={onBack}>
          Back to configuration
        </button>
      </div>
    </div>
  );
}

export default TriggerEventsPage;
