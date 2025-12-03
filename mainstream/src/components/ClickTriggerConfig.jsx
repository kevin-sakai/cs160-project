// components/trigger-events/ClickTriggerConfig.jsx
import React from "react";
import { BaseTriggerSettings } from "./BaseTriggerSettings";

export function ClickTriggerConfig({
  baseSettings,
  onBaseSettingsChange,
  specificSettings,
  onSpecificChange,
}) {
  const updateSpecific = (field, value) => {
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  return (
    <>
      <h2>When I Am Clicked</h2>
      <p>
        Choose screen areas that, when clicked with the mouse, will trigger an
        overlay.
      </p>

      {/* Click-specific fields */}
      <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Number of clicks required
          </label>
          <input
            type="number"
            min="1"
            value={specificSettings.requiredClicks ?? ""}
            onChange={(e) => updateSpecific("requiredClicks", e.target.value)}
            placeholder="e.g., 1"
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Clickable area description
          </label>
          <textarea
            value={specificSettings.clickAreaDescription ?? ""}
            onChange={(e) =>
              updateSpecific("clickAreaDescription", e.target.value)
            }
            placeholder="e.g., top-right corner, minimap area..."
            rows={3}
            style={{ width: "100%" }}
          />
          <small>
            Later you can replace this with a visual selector that lets users
            draw regions on the screen.
          </small>
        </div>
      </div>

      <h3 style={{ marginTop: "1.5rem" }}>Common settings</h3>
      <BaseTriggerSettings
        settings={baseSettings}
        onChange={onBaseSettingsChange}
      />
    </>
  );
}
