// src/components/BaseTriggerSettings.jsx
import React from "react";

/**
 * BaseTriggerSettings
 *
 * NOT a React component you render as <BaseTriggerSettings />.
 * Instead, it's a helper that returns grouped JSX blocks so each
 * Trigger config file can wrap them in its own collapsible sections.
 *
 * Usage:
 *   const groups = BaseTriggerSettings({
 *     settings: baseSettings,
 *     onChange: onBaseSettingsChange,
 *   });
 *
 *   <CollapsibleSection title="Trigger Timing">
 *     {groups.timing}
 *   </CollapsibleSection>
 *
 *   <CollapsibleSection title="On-Screen Behavior">
 *     {groups.display}
 *   </CollapsibleSection>
 *
 *   <CollapsibleSection title="Shortcuts & Control">
 *     {groups.shortcuts}
 *   </CollapsibleSection>
 */

export function BaseTriggerSettings({ settings = {}, onChange }) {
  // Defaults for all triggers
  const defaults = {
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

  const s = { ...defaults, ...settings };

  const update = (field, value) => {
    const next = { ...s, [field]: value };
    onChange(next);
  };

  // ==============================
  // TRIGGER TIMING SECTION
  // ==============================
  const timing = (
    <div style={{ display: "grid", gap: "1rem" }}>
      {/* Frequency */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Frequency
        </label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="number"
            min="1"
            value={s.frequencyValue}
            onChange={(e) => update("frequencyValue", e.target.value)}
            placeholder="e.g., 60"
            style={{ width: "90px" }}
          />
          <select
            value={s.frequencyUnit}
            onChange={(e) => update("frequencyUnit", e.target.value)}
          >
            <option value="seconds">seconds</option>
            <option value="minutes">minutes</option>
          </select>
        </div>
        <small>How often the trigger is allowed to fire.</small>
      </div>

      {/* Cooldown */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Cooldown
        </label>
        <input
          type="number"
          min="0"
          value={s.cooldown}
          onChange={(e) => update("cooldown", e.target.value)}
          placeholder="Seconds after firing before it can fire again"
          style={{ width: "100%" }}
        />
      </div>

      {/* Max displays */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Maximum number of displays
        </label>
        <input
          type="number"
          min="1"
          value={s.maxDisplays}
          onChange={(e) => update("maxDisplays", e.target.value)}
          placeholder="e.g., 5"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );

  // ==============================
  // ON-SCREEN BEHAVIOR SECTION
  // ==============================
  const display = (
    <div style={{ display: "grid", gap: "1rem" }}>
      {/* Display duration */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Display Duration
        </label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={s.displayDurationType}
            onChange={(e) =>
              update("displayDurationType", e.target.value)
            }
          >
            <option value="permanent">Permanent</option>
            <option value="timed">Timed</option>
          </select>

          {s.displayDurationType !== "permanent" && (
            <>
              <input
                type="number"
                min="1"
                value={s.displayDurationValue}
                onChange={(e) =>
                  update("displayDurationValue", e.target.value)
                }
                placeholder="Seconds"
                style={{ width: "90px" }}
              />
              <select
                value={s.displayDurationUnit}
                onChange={(e) =>
                  update("displayDurationUnit", e.target.value)
                }
              >
                <option value="seconds">seconds</option>
                <option value="minutes">minutes</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Override */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Override other overlays?
        </label>
        <select
          value={s.overrideOthers}
          onChange={(e) => update("overrideOthers", e.target.value)}
        >
          <option value="no">No</option>
          <option value="yes">Yes (hide other overlays)</option>
        </select>
      </div>
    </div>
  );

  // ==============================
  // SHORTCUTS & CONTROL SECTION
  // ==============================
  const shortcuts = (
    <div style={{ display: "grid", gap: "1rem" }}>
      {/* Hotkey */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Bind to hotkey (optional)
        </label>
        <input
          type="text"
          value={s.hotkey}
          onChange={(e) => update("hotkey", e.target.value)}
          placeholder="e.g., Ctrl+Shift+O"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );

  return { timing, display, shortcuts };
}


export default BaseTriggerSettings;