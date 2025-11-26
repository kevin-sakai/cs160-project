// src/components/obs-page.jsx
import { useEffect, useState } from "react";
import {
  getObsHealth,
  getScenes,
  createScene,
  getSceneSources,
  createSource,
  switchScene,
} from "../api/obs"; 
import '../components/obs-page';
import "./TriggerEvents.css";

function TriggerEventsPage() {
  const [selectedTrigger, setSelectedTrigger] = useState("timed");
  const [step, setStep] = useState("config"); // "config" or "overlays"

  // Timed Events configuration state
  const [startingTimeMinutes, setStartingTimeMinutes] = useState("");
  const [displayDurationType, setDisplayDurationType] = useState("permanent"); // "permanent" or "timed"
  const [displayDurationValue, setDisplayDurationValue] = useState("");
  const [displayDurationUnit, setDisplayDurationUnit] = useState("seconds"); // "seconds" | "minutes"
  const [frequencyValue, setFrequencyValue] = useState("");
  const [frequencyUnit, setFrequencyUnit] = useState("seconds"); // "seconds" | "minutes"
  const [maxDisplays, setMaxDisplays] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleTriggerChange(event) {
    const value = event.target.value;
    setSelectedTrigger(value);
    setStep("config");
    setErrorMsg("");
  }

  function handleNext() {
    if (selectedTrigger === "timed") {
      // maybe change later
      if (!startingTimeMinutes || Number(startingTimeMinutes) < 0) {
        setErrorMsg("Starting time must be a non-negative number.");
        return;
      }
      if (displayDurationType === "timed" && (!displayDurationValue || Number(displayDurationValue) <= 0)) {
        setErrorMsg("Display duration must be greater than 0.");
        return;
      }
      if (!frequencyValue || Number(frequencyValue) <= 0) {
        setErrorMsg("Frequency must be greater than 0.");
        return;
      }
      if (!maxDisplays || Number(maxDisplays) <= 0) {
        setErrorMsg("Maximum number of displays must be greater than 0.");
        return;
      }

      setErrorMsg("");

      // TODO: send to backend or save configuration
      // for now just log it so I can see it in DevTools:
      console.log("Timed Events configuration:", {
        startingTimeMinutes,
        displayDurationType,
        displayDurationValue:
          displayDurationType === "permanent" ? null : displayDurationValue,
        displayDurationUnit:
          displayDurationType === "permanent" ? null : displayDurationUnit,
        frequencyValue,
        frequencyUnit,
        maxDisplays,
      });
    }

    setStep("overlays");
  }

  function handleBackToConfig() {
    setStep("config");
  }

  function renderTimedEventsConfig() {
    return (
      <>
        <h2>Timed Events Configuration</h2>
        <p>
          Configure when, how long, and how often an overlay appears, and the maximum number of times it can display.
        </p>

        {errorMsg && (
          <p style={{ color: "red", marginBottom: "1rem" }}>{errorMsg}</p>
        )}

        <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
          {/* Starting time */}
          <div>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Starting time (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={startingTimeMinutes}
              onChange={(e) => setStartingTimeMinutes(e.target.value)}
              placeholder="e.g., 2"
              style={{ width: "100%" }}
            />
            <small>
              This acts like a timer. When it counts down to zero, the overlay will begin showing.
            </small>
          </div>

          {/* Display duration */}
          <div>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Display duration
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <select
                value={displayDurationType}
                onChange={(e) => setDisplayDurationType(e.target.value)}
              >
                <option value="permanent">Permanent</option>
                <option value="timed">Timed</option>
              </select>

              {displayDurationType === "timed" && (
                <>
                  <input
                    type="number"
                    min="1"
                    value={displayDurationValue}
                    onChange={(e) => setDisplayDurationValue(e.target.value)}
                    placeholder="Duration"
                    style={{ width: "90px" }}
                  />
                  <select
                    value={displayDurationUnit}
                    onChange={(e) => setDisplayDurationUnit(e.target.value)}
                  >
                    <option value="seconds">seconds</option>
                    <option value="minutes">minutes</option>
                  </select>
                </>
              )}
            </div>
            <small>
              Permanent overlays stay until manually removed; timed overlays disappear after the set duration.
            </small>
          </div>

          {/* Frequency */}
          <div>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Frequency
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="number"
                min="1"
                value={frequencyValue}
                onChange={(e) => setFrequencyValue(e.target.value)}
                placeholder="e.g., 4"
                style={{ width: "90px" }}
              />
              <select
                value={frequencyUnit}
                onChange={(e) => setFrequencyUnit(e.target.value)}
              >
                <option value="seconds">seconds</option>
                <option value="minutes">minutes</option>
              </select>
            </div>
            <small>How often the overlay appears (for example, every 4 minutes).</small>
          </div>

          {/* Maximum number of displays */}
          <div>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Maximum number of displays
            </label>
            <input
              type="number"
              min="1"
              value={maxDisplays}
              onChange={(e) => setMaxDisplays(e.target.value)}
              placeholder="e.g., 5"
              style={{ width: "100%" }}
            />
            <small>This sets a cap on the total number of times the overlay will appear.</small>
          </div>
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <button type="button" onClick={handleNext}>
            Next: Choose Overlay
          </button>
        </div>
      </>
    );
  }

  function renderOverlayGrid() {
    // placeholder grid of colored boxes
    const dummyOverlays = [
      "#e57373",
      "#64b5f6",
      "#81c784",
      "#ffb74d",
      "#ba68c8",
      "#4db6ac",
    ];

    return (
      <>
        <h2>Overlay Options (Placeholder)</h2>
        <p>
          This is a placeholder grid of overlay options. Later, each box can represent a specific overlay layout or asset.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "1rem",
            maxWidth: "600px",
          }}
        >
          {dummyOverlays.map((color, index) => (
            <div
              key={index}
              style={{
                backgroundColor: color,
                height: "80px",
                borderRadius: "8px",
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: "1.5rem" }}>
          <button type="button" onClick={handleBackToConfig}>
            Back to configuration
          </button>
        </div>
      </>
    );
  }

  return (
      <div className="trigger-events-container">
        <div style={{ padding: "1rem" }}>
        <h1>Trigger Events</h1>
        <p>
            Configure how your overlays behave in OBS based on different trigger types. Right now, only Timed Events are available.
        </p>

        <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>
            Trigger type
            </label>
            <select value={selectedTrigger} onChange={handleTriggerChange}>
            <option value="timed">Timed Events</option>
            {/* Future options go here, e.g.:
                <option value="chat-activity">Chat Activity</option>
                <option value="new-follower">New Follower</option>
            */}
            </select>
        </div>

        {selectedTrigger === "timed" && (
            step === "config" ? renderTimedEventsConfig() : renderOverlayGrid()
        )}
        </div>
    </div>
  );
}

export default TriggerEventsPage;
