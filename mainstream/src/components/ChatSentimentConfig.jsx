// components/trigger-events/ChatSentimentConfig.jsx
import React from "react";
import { BaseTriggerSettings } from "./BaseTriggerSettings";

export function ChatSentimentConfig({
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
      <h2>Chat Sentiment & Themes</h2>
      <p>
        Use an LLM to analyze chat sentiment or themes, and trigger overlays
        when certain moods or phrases appear.
      </p>

      <div style={{ display: "grid", gap: "1rem", maxWidth: "480px" }}>
        {/* Match mode */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            What should the LLM look for?
          </label>
          <select
            value={specificSettings.matchType || "sentiment"}
            onChange={(e) => updateSpecific("matchType", e.target.value)}
          >
            <option value="sentiment">Overall sentiment (happy, salty, hype)</option>
            <option value="word">Specific word</option>
            <option value="phrase">Specific phrase</option>
            <option value="theme">High-level theme (e.g., "complaints", "hype")</option>
          </select>
        </div>

        {/* Target value */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Target sentiment / word / phrase / theme
          </label>
          <input
            type="text"
            value={specificSettings.target ?? ""}
            onChange={(e) => updateSpecific("target", e.target.value)}
            placeholder='e.g., "hype", "happy", "gg", "complaining"'
            style={{ width: "100%" }}
          />
        </div>

        {/* Minimum number of users/chatters */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Minimum number of chatters with this sentiment/word/phrase
          </label>
          <input
            type="number"
            min="1"
            value={specificSettings.minUsers ?? ""}
            onChange={(e) => updateSpecific("minUsers", e.target.value)}
            placeholder="e.g., 5"
            style={{ width: "100%" }}
          />
        </div>

        {/* Manual approval */}
        <div>
          <label style={{ display: "block", marginBottom: "0.25rem" }}>
            Require manual approval before triggering?
          </label>
          <select
            value={specificSettings.requireApproval ?? "no"}
            onChange={(e) => updateSpecific("requireApproval", e.target.value)}
          >
            <option value="no">No, trigger automatically</option>
            <option value="yes">
              Yes, show me a notification to approve first
            </option>
          </select>
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
