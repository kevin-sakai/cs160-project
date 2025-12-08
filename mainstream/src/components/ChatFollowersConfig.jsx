// src/components/ChatFollowersConfig.jsx
import React, { useState } from "react";
import { BaseTriggerSettings } from "./BaseTriggerSettings";
import { CollapsibleSection } from "./CollapsibleSection";
import help from "../assets/help.png";

export function ChatFollowersConfig({
  baseSettings,
  onBaseSettingsChange,
  specificSettings,
  onSpecificChange,
  onContinue,
  setError,
}) {
  const [trighelp, setTrigHelp] = useState(false);

  const updateSpecific = (field, value) => {
    setError?.(""); // clear errors on edit
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  const handleNext = () => {
    if (!specificSettings.threshold || specificSettings.threshold <= 0) {
      setError?.("Please enter a valid follower threshold before continuing.");
      return;
    }

    onContinue?.();
  };

  // Get grouped base settings blocks (timing, display, shortcuts)
  const groups = BaseTriggerSettings({
    settings: baseSettings,
    onChange: onBaseSettingsChange,
  });

  return (
    <div className="trigger-card">
      {/* Header */}
      <div className="header">
        <h2>Chat Followers</h2>
        <img
          className="t-helpicon"
          src={help}
          alt="Help"
          onClick={() => setTrigHelp(!trighelp)}
        />
      </div>

      {trighelp && (
        <p className="trigger-description">
          Trigger an overlay when you reach a follower milestone or receive new
          followers (via Twitch API once configured).
        </p>
      )}

      {/* SPECIFIC SETTINGS */}
      <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
        {/* Mode */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Trigger when...
          </label>
          <select
            value={specificSettings.mode || "new"}
            onChange={(e) => updateSpecific("mode", e.target.value)}
          >
            <option value="new">New followers count reaches...</option>
            <option value="total">Total follower count reaches...</option>
          </select>
        </div>

        {/* Threshold */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Follower threshold
          </label>
          <input
            type="number"
            min="1"
            value={specificSettings.threshold ?? 1}
            onChange={(e) => updateSpecific("threshold", e.target.value)}
            placeholder="e.g., 500 (total) or 3 (new)"
            style={{ width: "100%" }}
          />
        </div>

        {/* Show usernames */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Display usernames of followers?
          </label>
          <select
            value={specificSettings.showUsernames ?? "yes"}
            onChange={(e) => updateSpecific("showUsernames", e.target.value)}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Only donors */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Only followers who have donated?
          </label>
          <select
            value={specificSettings.onlyDonors ?? "no"}
            onChange={(e) => updateSpecific("onlyDonors", e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {/* Only chatters */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Only followers who have chatted this stream?
          </label>
          <select
            value={specificSettings.onlyChatters ?? "no"}
            onChange={(e) => updateSpecific("onlyChatters", e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>

      {/* ADVANCED SETTINGS (per-base trigger settings, grouped & collapsible) */}
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
          onClick={handleNext}
          className="trigger-next-button"
          type="button"
        >
          Next: Choose Overlay
        </button>
      </div>
    </div>
  );
}
export default ChatFollowersConfig;