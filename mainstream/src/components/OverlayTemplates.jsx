// src/components/OverlayTemplates.jsx
import React from "react";
import "./OverlayTemplates.css";

export const OVERLAY_TEMPLATES = [
  { id: "follower-glow", name: "Follower Alert – Glow", triggerType: "followers" },
  { id: "timed-pomodoro", name: "Timed Event – Pomodoro", triggerType: "timed" },
  { id: "click-burst", name: "Click Trigger – Burst", triggerType: "click" },
  { id: "sentiment-meter", name: "Sentiment – Vibe Meter", triggerType: "sentiment" },
  { id: "banning-shield", name: "Moderation – Shield Alert", triggerType: "banning" },
  { id: "glass-card", name: "Universal – Glass Card", triggerType: "any" },
  { id: "sidebar-alert", name: "Universal – Sidebar Alert", triggerType: "any" },
  { id: "gradient-ribbon", name: "Universal – Gradient Ribbon", triggerType: "any" },
  { id: "rainbow", name: "Universal – Rainbow Flash", triggerType: "any" },
];

export function OverlayTemplatePreview({ templateId, data = {} }) {
  switch (templateId) {
    case "follower-glow":
      return (
        <div className="overlay-template overlay-template--follower-glow">
          <div className="overlay-pill">
            <div className="overlay-avatar-dot" />
            <div className="overlay-text-block">
              <div className="overlay-label">New Follower</div>
              <div className="overlay-value">{`{username}`}</div>
            </div>
          </div>
        </div>
      );

    case "timed-pomodoro":
      return (
        <div className="overlay-template overlay-template--timed-pomodoro">
          <div className="pomodoro-circle">
            <div className="pomodoro-fill" />
            <span className="pomodoro-time">{`{time}`}</span>
          </div>
          <div className="pomodoro-caption">Next event in</div>
        </div>
      );

    case "click-burst":
      return (
        <div className="overlay-template overlay-template--click-burst">
          <div className="click-ripple click-ripple--outer" />
          <div className="click-ripple click-ripple--inner" />
          <div className="click-counter">
            Clicks: <span>{`{count}`}</span>
          </div>
        </div>
      );

    case "sentiment-meter":
      return (
        <div className="overlay-template overlay-template--sentiment-meter">
          <div className="sentiment-header">Chat Vibe</div>
          <div className="sentiment-bar">
            <div className="sentiment-fill" />
          </div>
          <div className="sentiment-footer">
            <span className="sentiment-label">{`{sentiment}`}</span>
            <span className="sentiment-score">{`{score}`}</span>
          </div>
        </div>
      );

    case "banning-shield":
      return (
        <div className="overlay-template overlay-template--banning-shield">
          <div className="shield-icon" />
          <div className="shield-text">
            <div className="shield-label">Auto-Moderation</div>
            <div className="shield-message">Action taken</div>
          </div>
        </div>
      );

    case "glass-card":
      return (
        <div className="overlay-template overlay-template--glass-card">
          <div className="glass-card-inner">
            <div className="glass-title">{`{Trigger Name}`}</div>
            <div className="glass-body">{`{Trigger message or stats}`}</div>
          </div>
        </div>
      );

    case "sidebar-alert":
      return (
        <div className="overlay-template overlay-template--sidebar-alert">
          <div className="sidebar-header">{`{Trigger Title}`}</div>
          <div className="sidebar-body">{`{Short description or status}`}</div>
        </div>
      );

    case "gradient-ribbon":
      return (
        <div className="overlay-template overlay-template--gradient-ribbon">
          <div className="ribbon-content">
            <span className="ribbon-label">{`{Event Type}`}</span>
            <span className="ribbon-message">{`{Message text goes here}`}</span>
          </div>
        </div>
      );

    default:
      return null;

    case "rainbow":
        return (
        <div className="overlay-template overlay-template--rainbow">
          <div className="rainbow-flash">
            <span className="rainbow-text">{`{Message}`}</span>
          </div>
        </div>
      );
  }
}

export function OverlayTemplateCard({ template, isSelected, onSelect }) {
  return (
    <button
      type="button"
      className={`overlay-template-card ${
        isSelected ? "overlay-template-card--selected" : ""
      }`}
      onClick={() => onSelect(template.id)}
    >
      <OverlayTemplatePreview templateId={template.id} />
      <div className="overlay-template-name">{template.name}</div>
    </button>
  );
}
export default OverlayTemplateCard;