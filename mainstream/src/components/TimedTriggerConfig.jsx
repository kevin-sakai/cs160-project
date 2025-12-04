import React, { useState } from "react";

/**
 * Shared base settings for all trigger types:
 * - frequency & cooldown
 * - display duration
 * - max number of times to show
 * - whether to override other overlays
 * - optional hotkey binding
 */
import help from "../assets/help.png";
export function BaseTriggerSettings({ settings, onChange }) {
  const update = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div className="trigger-card">
      {/* Frequency */}
      <div className="trigger-field">
        <label>Frequency</label>
        <div className="field-row">
          <input
            type="number"
            min="1"
            value={settings.frequencyValue ?? ""}
            onChange={(e) => update("frequencyValue", e.target.value)}
            placeholder="e.g., 4"
          />
          <select
            value={settings.frequencyUnit || "seconds"}
            onChange={(e) => update("frequencyUnit", e.target.value)}
          >
            <option value="seconds">seconds</option>
            <option value="minutes">minutes</option>
          </select>
        </div>
        <small>
          How often this trigger is allowed to fire while it&apos;s active.
        </small>
      </div>

      {/* Cooldown */}
      <div className="trigger-field">
        <label>Cooldown</label>
        <input
          type="number"
          min="0"
          value={settings.cooldown ?? ""}
          onChange={(e) => update("cooldown", e.target.value)}
          placeholder="Seconds of cooldown after firing"
        />
      </div>

      {/* Display duration */}
      <div className="trigger-field">
        <label>Display duration</label>
        <div className="field-row">
          <select
            value={settings.displayDurationType || "permanent"}
            onChange={(e) => update("displayDurationType", e.target.value)}
          >
            <option value="permanent">Permanent</option>
            <option value="timed">Timed</option>
          </select>

          {settings.displayDurationType === "timed" && (
            <>
              <input
                type="number"
                min="1"
                value={settings.displayDurationValue ?? ""}
                onChange={(e) => update("displayDurationValue", e.target.value)}
                placeholder="Duration"
              />
              <select
                value={settings.displayDurationUnit || "seconds"}
                onChange={(e) => update("displayDurationUnit", e.target.value)}
              >
                <option value="seconds">seconds</option>
                <option value="minutes">minutes</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Total number of times it's displayed */}
      <div className="trigger-field">
        <label>Maximum number of displays</label>
        <input
          type="number"
          min="1"
          value={settings.maxDisplays ?? ""}
          onChange={(e) => update("maxDisplays", e.target.value)}
          placeholder="e.g., 5"
        />
      </div>

      {/* Override other overlays */}
      <div className="trigger-field">
        <label>Override other overlays?</label>
        <select
          value={settings.overrideOthers ?? "no"}
          onChange={(e) => update("overrideOthers", e.target.value)}
        >
          <option value="no">No</option>
          <option value="yes">Yes (hide other overlays while active)</option>
        </select>
      </div>

      {/* Hotkey binding */}
      <div className="trigger-field">
        <label>Bind to hotkey? (optional)</label>
        <input
          type="text"
          value={settings.hotkey ?? ""}
          onChange={(e) => update("hotkey", e.target.value)}
          placeholder="e.g., Ctrl+Shift+O"
        />
      </div>
    </div>
  );
}

/**
 * Timed events configuration.
 * This is used when the trigger type is "Timed".
 * It composes BaseTriggerSettings plus its own "starting time" field.
 */
export default function TimedEventsConfig({
  baseSettings,
  onBaseSettingsChange,
  specificSettings,
  onSpecificChange,
  onContinue,
  setError,
}) {
  const updateSpecific = (field, value) => {
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  const handleNext = () => {
    // Basic validation for timed events
    const start = Number(specificSettings.startingTimeMinutes ?? 0);
    if (Number.isNaN(start) || start < 0) {
      setError?.("Starting time must be a non-negative number.");
      return;
    }

    const freqVal = Number(baseSettings.frequencyValue);
    if (!freqVal || freqVal <= 0) {
      setError?.("Frequency must be greater than 0.");
      return;
    }

    const maxDisplays = Number(baseSettings.maxDisplays);
    if (!maxDisplays || maxDisplays <= 0) {
      setError?.("Maximum number of displays must be greater than 0.");
      return;
    }

    if (
      baseSettings.displayDurationType === "timed" &&
      (!baseSettings.displayDurationValue ||
        Number(baseSettings.displayDurationValue) <= 0)
    ) {
      setError?.("Display duration must be greater than 0.");
      return;
    }

    // If everything is valid, clear errors and continue
    setError?.("");
    onContinue?.();
  };

  const [trighelp, setTrigHelp] = useState(false);

  return (
    <div className="trigger-card">
      <div className="header">
     
        <h2>Timed Events</h2>
        <img
          className="t-helpicon"
          src={help}
          onClick={() => {
            setTrigHelp(!trighelp);
          }}
        />
      </div>
      {trighelp ? (
        <p className="trigger-description">
          Trigger an overlay on a schedule. Configure how long to wait before
          the first trigger, how often it repeats, and how long it stays
          visible.
        </p>
      ) : null}

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
          How long to wait after going live before this timed overlay can first
          appear.
        </small>
      </div>

      <h3 className="trigger-subheading">Common settings</h3>
      <BaseTriggerSettings
        settings={baseSettings}
        onChange={onBaseSettingsChange}
      />

      <div className="trigger-actions">
        <button type="button" onClick={handleNext}>
          Next: Choose Overlay
        </button>
      </div>
    </div>
  );
}
