// components/trigger-events/ClickTriggerConfig.jsx
import React from "react";
import { BaseTriggerSettings } from "./BaseTriggerSettings";
import help from "../assets/help.png";
import { useState } from "react";

export function ClickTriggerConfig({
  baseSettings,
  onBaseSettingsChange,
  specificSettings,
  onSpecificChange,
}) {
  const updateSpecific = (field, value) => {
    onSpecificChange({ ...specificSettings, [field]: value });
  };
  const [trighelp, setTrigHelp] = useState(false);
  return (
    <>
    <div className="header">
      <h2>When I Am Clicked</h2>
      <img
        className="t-helpicon"
        src={help}
        onClick={() => {
          setTrigHelp(!trighelp);
        }}
      />
</div>
      {trighelp ? (
        <p  className="trigger-description">
          Choose screen areas that, when clicked with the mouse, will trigger an
          overlay.
        </p>
      ) : null}

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
