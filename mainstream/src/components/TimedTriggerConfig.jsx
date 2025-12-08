// src/components//TimedTriggerConfig.jsx
import React, { useState } from "react";
import { BaseTriggerSettings } from "./BaseTriggerSettings";
import { CollapsibleSection } from "./CollapsibleSection";
import help from "../assets/help.png";

/**
 * Timed events configuration.
 * This is used when the trigger type is "Timed".
 * It uses shared base settings (frequency, duration, etc.)
 * plus its own "starting time" configuration.
 */
export default function TimedEventsConfig({
  baseSettings,
  onBaseSettingsChange,
  specificSettings,
  onSpecificChange,
  onContinue,
  setError,
}) {
  const [trighelp, setTrigHelp] = useState(false);

  const updateSpecific = (field, value) => {
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  const handleNext = () => {
    // --- 1) Merge defaults with current baseSettings so validation sees the same defaults as UI ---
    const baseDefaults = {
      frequencyValue: 60,
      frequencyUnit: "seconds",
      cooldown: 0,
      displayDurationType: "permanent",
      displayDurationValue: 10,
      displayDurationUnit: "seconds",
      maxDisplays: 5,
      overrideOthers: "no",
      hotkey: "",
    };

    const effectiveBase = { ...baseDefaults, ...(baseSettings || {}) };

    // Basic validation for timed events
    const start = Number(specificSettings.startingTimeMinutes ?? 0);
    if (Number.isNaN(start) || start < 0) {
      setError?.("Starting time must be a non-negative number.");
      return;
    }

    const freqVal = Number(effectiveBase.frequencyValue);
    if (!freqVal || freqVal <= 0) {
      setError?.("Frequency must be greater than 0.");
      return;
    }

    const maxDisplays = Number(effectiveBase.maxDisplays);
    if (!maxDisplays || maxDisplays <= 0) {
      setError?.("Maximum number of displays must be greater than 0.");
      return;
    }

    if (
      effectiveBase.displayDurationType === "timed" &&
      (!effectiveBase.displayDurationValue ||
        Number(effectiveBase.displayDurationValue) <= 0)
    ) {
      setError?.("Display duration must be greater than 0.");
      return;
    }

    // If everything is valid, clear errors and continue
    setError?.("");
    onContinue?.();
  };

  // Get grouped shared settings for this trigger
  const groups = BaseTriggerSettings({
    settings: baseSettings,
    onChange: onBaseSettingsChange,
  });

  return (
    <div className="trigger-card">
      {/* Header */}
      <div className="header">
        <h2>Timed Events</h2>
        <img
          className="t-helpicon"
          src={help}
          alt="Help"
          onClick={() => setTrigHelp(!trighelp)}
        />
      </div>

      {trighelp && (
        <p className="trigger-description">
          Trigger an overlay on a schedule. Configure how long to wait before
          the first trigger, how often it repeats, and how long it stays
          visible.
        </p>
      )}

      {/* TIMED-SPECIFIC SETTINGS */}
      <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
        {/* Starting time */}
        <div className="trigger-field">
          <label>Starting time</label>
          <div className="field-row">
            <input
              type="number"
              min="0"
              value={specificSettings.startingTimeMinutes ?? ""}
              onChange={(e) =>
                updateSpecific("startingTimeMinutes", e.target.value)
              }
              placeholder="e.g., 10"
            />
            <span>minutes</span>
          </div>
          <small>
            How long to wait after going live before this timed overlay can
            first appear.
          </small>
        </div>
      </div>

      {/* ADVANCED SETTINGS (shared base options) */}
      <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem" }}>
        Advanced Settings
      </h3>

      <CollapsibleSection title="Trigger Timing" defaultOpen={false}>
        {groups.timing}
      </CollapsibleSection>

      <CollapsibleSection title="On-Screen Behavior" defaultOpen={false}>
        {groups.display}
      </CollapsibleSection>

      <CollapsibleSection title="Shortcuts & Control" defaultOpen={false}>
        {groups.shortcuts}
      </CollapsibleSection>

      {/* NEXT BUTTON */}
      <div className="trigger-actions" style={{ marginTop: "1.5rem" }}>
        <button
          type="button"
          onClick={handleNext}
          className="trigger-next-button"
        >
          Next: Choose Overlay
        </button>
      </div>
    </div>
  );
}
