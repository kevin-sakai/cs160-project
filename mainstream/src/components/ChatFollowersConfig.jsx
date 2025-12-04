// components/ChatFollowersConfig.jsx
import React from "react";
import { BaseTriggerSettings } from "./BaseTriggerSettings";
import help from "../assets/help.png";
import { useState } from "react";

export function ChatFollowersConfig({
  baseSettings,
  onBaseSettingsChange,
  specificSettings,
  onSpecificChange,
  onContinue, // <-- ADDED
  setError, // <-- ADDED
}) {
  const updateSpecific = (field, value) => {
    setError?.(""); // clear errors when user changes something
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  const handleNext = () => {
    // Optional basic validation
    if (!specificSettings.threshold || specificSettings.threshold <= 0) {
      setError?.("Please enter a valid follower threshold before continuing.");
      return;
    }

    if (onContinue) onContinue();
  };
const [trighelp, setTrigHelp] = useState(false);
  return (
    <div className="trigger-card">
      <div className="header">
        <h2>Chat Followers</h2>
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
        Trigger an overlay when you reach a follower milestone or receive new
        followers (via Twitch API, once configured).
        </p>
      ) : null}


      <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
        {/* Mode: total vs new followers */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Trigger when...
          </label>
          <select
            value={specificSettings.mode || "total"}
            onChange={(e) => updateSpecific("mode", e.target.value)}
          >
            <option value="total">Total follower count reaches...</option>
            <option value="new">New followers count reaches...</option>
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
            value={specificSettings.threshold ?? ""}
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

      {/* Common shared settings */}
      <h3 style={{ marginTop: "1.5rem" }}>Common settings</h3>
      <BaseTriggerSettings
        settings={baseSettings}
        onChange={onBaseSettingsChange}
      />

      {/* NEXT BUTTON (required to go to overlays) */}
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
