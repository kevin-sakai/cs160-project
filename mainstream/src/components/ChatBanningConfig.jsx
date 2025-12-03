// components/trigger-events/ChatBanningConfig.jsx
import React from "react";

export function ChatBanningConfig({ specificSettings, onSpecificChange }) {
  const updateSpecific = (field, value) => {
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  return (
    <>
      <h2>Chat Banning & Filtering</h2>
      <p>
        Automatically remove or flag messages that match certain patterns
        (backseat gaming, spoilers, spam, etc.).
      </p>

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
    </>
  );
}
