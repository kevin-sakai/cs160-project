// components/ChatBanningConfig.jsx
import React from "react";
import help from "../assets/help.png";
import { useState } from "react";

export function ChatBanningConfig({
  specificSettings,
  onSpecificChange,
  onDone, // <-- ADDED (instead of onContinue)
  setError, // <-- ADDED for validation
}) {
  const updateSpecific = (field, value) => {
    setError?.(""); // clear errors as user edits
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  const handleDone = () => {
    // Validation: If spoilers are enabled, gameName must be provided
    if (
      specificSettings.banSpoilers === "yes" &&
      (!specificSettings.gameName ||
        specificSettings.gameName.trim().length === 0)
    ) {
      setError?.("Please enter the name of the game for spoiler detection.");
      return;
    }

    // Allow ChatBanning triggers to skip overlays entirely
    if (onDone) onDone();
  };
  const [trighelp, setTrigHelp] = useState(false);
  return (
    <div className="trigger-card">
      <div className="header">
        <h2>Chat Banning & Filtering</h2>
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
          Automatically detect, flag, or remove messages that match patterns
          (backseat gaming, spoilers, spam, etc.).
        </p>
      ) : null}

      <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
        {/* Backseat gaming */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Ban backseat gaming?
          </label>
          <select
            value={specificSettings.banBackseat ?? "no"}
            onChange={(e) => updateSpecific("banBackseat", e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {/* Spoilers */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Ban spoilers?
          </label>
          <select
            value={specificSettings.banSpoilers ?? "no"}
            onChange={(e) => updateSpecific("banSpoilers", e.target.value)}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        {specificSettings.banSpoilers === "yes" && (
          <div>
            <label style={{ display: "block", marginBottom: "0.25rem" }}>
              Name of the game (for spoiler detection)
            </label>
            <input
              type="text"
              value={specificSettings.gameName ?? ""}
              onChange={(e) => updateSpecific("gameName", e.target.value)}
              placeholder="e.g., Elden Ring"
              style={{ width: "100%" }}
            />
          </div>
        )}

        {/* Spam filter */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Filter out spam?
          </label>
          <select
            value={specificSettings.filterSpam ?? "yes"}
            onChange={(e) => updateSpecific("filterSpam", e.target.value)}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        {/* Custom banned phrases */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Custom banned words / phrases
          </label>
          <textarea
            value={specificSettings.bannedPhrases ?? ""}
            onChange={(e) => updateSpecific("bannedPhrases", e.target.value)}
            placeholder="Comma-separated list: word1, phrase 2, ..."
            rows={3}
            style={{ width: "100%" }}
          />
        </div>
      </div>

      {/* DONE BUTTON */}
      <div className="trigger-actions" style={{ marginTop: "1.5rem" }}>
        <button
          onClick={handleDone}
          type="button"
          className="trigger-done-button"
        >
          Done
        </button>
      </div>
    </div>
  );
}
