// components/ChatSentimentConfig.jsx
import React from "react";
import { BaseTriggerSettings } from "./BaseTriggerSettings";
import help from "../assets/help.png";
import { useState } from "react";

export function ChatSentimentConfig({
  baseSettings,
  onBaseSettingsChange,
  specificSettings,
  onSpecificChange,
  onContinue, // <-- ADDED
  setError, // <-- ADDED
}) {
  const updateSpecific = (field, value) => {
    setError?.(""); // clear errors when user interacts
    onSpecificChange({ ...specificSettings, [field]: value });
  };

  const handleNext = () => {
    // Basic required validation
    if (
      !specificSettings.target ||
      specificSettings.target.trim().length === 0
    ) {
      setError?.(
        "Please enter a target sentiment / word / phrase / theme before continuing."
      );
      return;
    }

    if (!specificSettings.minUsers || Number(specificSettings.minUsers) <= 0) {
      setError?.("Minimum number of chatters must be at least 1.");
      return;
    }

    if (onContinue) onContinue();
  };
  const [trighelp, setTrigHelp] = useState(false);
  return (
    <div className="trigger-card">
      <div className="header">
        <h2>Chat Sentiment & Themes</h2>
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
          Use an LLM to analyze chat sentiment or themes, and trigger overlays
          when certain moods or phrases appear.
        </p>
      ) : null}

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
            <option value="sentiment">
              Overall sentiment (happy, salty, hype)
            </option>
            <option value="word">Specific word</option>
            <option value="phrase">Specific phrase</option>
            <option value="theme">
              High-level theme (e.g., "complaints", "hype")
            </option>
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

      {/* Common shared settings */}
      <h3 style={{ marginTop: "1.5rem" }}>Common settings</h3>
      <BaseTriggerSettings
        settings={baseSettings}
        onChange={onBaseSettingsChange}
      />

      {/* NEXT BUTTON */}
      <div className="trigger-actions" style={{ marginTop: "1.5rem" }}>
        <button
          onClick={handleNext}
          type="button"
          className="trigger-next-button"
        >
          Next: Choose Overlay
        </button>
      </div>
    </div>
  );
}
