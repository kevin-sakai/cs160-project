// components/trigger-events/BaseTriggerSettings.jsx
import React from "react";

export function BaseTriggerSettings({ settings, onChange }) {
  const update = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  return (
    <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
      {/* Frequency */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Frequency
        </label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="number"
            min="1"
            value={settings.frequencyValue ?? ""}
            onChange={(e) => update("frequencyValue", e.target.value)}
            placeholder="e.g., 4"
            style={{ width: "90px" }}
          />
          <select
            value={settings.frequencyUnit || "seconds"}
            onChange={(e) => update("frequencyUnit", e.target.value)}
          >
            <option value="seconds">seconds</option>
            <option value="minutes">minutes</option>
          </select>
        </div>
      </div>

      {/* Cooldown */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Cooldown
        </label>
        <input
          type="number"
          min="0"
          value={settings.cooldown ?? ""}
          onChange={(e) => update("cooldown", e.target.value)}
          placeholder="Seconds of cooldown after firing"
          style={{ width: "100%" }}
        />
      </div>

      {/* How long it's displayed */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Display duration
        </label>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <select
            value={settings.displayDurationType || "permanent"}
            onChange={(e) => update("displayDurationType", e.target.value)}
          >
            <option value="permanent">Permanent</option>
            <option value="timed">Timed</option>
          </select>

          {settings.displayDurationType !== "permanent" && (
            <>
              <input
                type="number"
                min="1"
                value={settings.displayDurationValue ?? ""}
                onChange={(e) =>
                  update("displayDurationValue", e.target.value)
                }
                placeholder="Duration"
                style={{ width: "90px" }}
              />
              <select
                value={settings.displayDurationUnit || "seconds"}
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

      {/* Total number of times it's displayed */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Maximum number of displays
        </label>
        <input
          type="number"
          min="1"
          value={settings.maxDisplays ?? ""}
          onChange={(e) => update("maxDisplays", e.target.value)}
          placeholder="e.g., 5"
          style={{ width: "100%" }}
        />
      </div>

      {/* Override other overlays */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Override other overlays?
        </label>
        <select
          value={settings.overrideOthers ?? "no"}
          onChange={(e) => update("overrideOthers", e.target.value)}
        >
          <option value="no">No</option>
          <option value="yes">Yes (hide other overlays while active)</option>
        </select>
      </div>

      {/* Hotkey binding */}
      <div>
        <label style={{ display: "block", marginBottom: "0.25rem" }}>
          Bind to hotkey? (optional)
        </label>
        <input
          type="text"
          value={settings.hotkey ?? ""}
          onChange={(e) => update("hotkey", e.target.value)}
          placeholder="e.g., Ctrl+Shift+O"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
