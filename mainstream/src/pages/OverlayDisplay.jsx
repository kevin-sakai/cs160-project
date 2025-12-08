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
        position: "fixed",
        inset: 0,
        margin: 0,
        padding: 0,
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <OverlayTemplatePreview templateId={templateId} />
    </div>
  );
}
