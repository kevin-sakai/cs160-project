// src/pages/OverlayDisplay.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import { OverlayTemplatePreview } from "../components/OverlayTemplates";
import "../components/OverlayTemplates.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function OverlayDisplay() {
  const query = useQuery();
  const templateId = query.get("template") || "glass-card";

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Only the overlay preview, nothing else */}
      <OverlayTemplatePreview templateId={templateId} />
    </div>
  );
}
