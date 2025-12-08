// components/ClickTriggerConfig.jsx
import React, { useState } from "react";
import { BaseTriggerSettings } from "./BaseTriggerSettings";
import { CollapsibleSection } from "./CollapsibleSection";
import help from "../assets/help.png";

export function ClickTriggerConfig({
  baseSettings,
  onBaseSettingsChange,
  specificSettings,
  onSpecificChange,
}) {
  const [trighelp, setTrigHelp] = useState(false);

  const updateSpecific = (field, value) => {
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  // Shared base trigger settings, grouped
  const groups = BaseTriggerSettings({
    settings: baseSettings,
    onChange: onBaseSettingsChange,
  });

  return (
    <div className="trigger-card">
      {/* Header */}
      <div className="header">
        <h2>When I Am Clicked</h2>
        <img
          className="t-helpicon"
          src={help}
          alt="Help"
          onClick={() => setTrigHelp(!trighelp)}
        />
      </div>

      {trighelp && (
        <p className="trigger-description">
          Choose screen areas that, when clicked with the mouse, will trigger an
          overlay.
        </p>
      )}

      {/* CLICK-SPECIFIC FIELDS */}
      <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
        {/* Number of clicks required */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Number of clicks required
          </label>
          <input
            type="number"
            min="1"
            value={specificSettings.requiredClicks ?? 1}   // ← default = 1
            onChange={(e) => updateSpecific("requiredClicks", e.target.value)}
            placeholder="e.g., 1"
            style={{ width: "100%" }}
          />
        </div>

        {/* Clickable area description */}
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
    </div>
  );
}
export default ClickTriggerConfig;