import React, { useState } from "react";
import "./TriggerEvents.css";

import TimedEventsConfig, { BaseTriggerSettings } from "../components/TimedTriggerConfig";

import { ChatFollowersConfig } from "../components/ChatFollowersConfig";
import { ChatBanningConfig } from "../components/ChatBanningConfig";
import { ChatSentimentConfig } from "../components/ChatSentimentConfig";
import { ClickTriggerConfig } from "../components/ClickTriggerConfig";

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
          </aside>

          {/* Right side: config or overlay selection */}
          <section className="trigger-main">
            {errorMsg && <div className="trigger-error">{errorMsg}</div>}

            {step === "config" ? (
              renderTriggerConfig()
            ) : (
              <OverlayGrid onBack={handleBackToConfig} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * Step 2: overlay selection grid.
 * You can later wire these tiles up to real overlay presets.
 */
function OverlayGrid({ onBack }) {
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
      <h2>Choose an Overlay</h2>
      <p>
        This is a placeholder grid of overlay options. Later, each box can
        represent a specific overlay layout, animation, or asset.
      </p>

      <div className="overlay-grid">
        {dummyOverlays.map((color, index) => (
          <button
            key={index}
            type="button"
            className="overlay-tile"
            style={{ backgroundColor: color }}
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
