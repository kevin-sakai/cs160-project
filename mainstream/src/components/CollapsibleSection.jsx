// src/components/CollapsibleSection.jsx
import React, { useState } from "react";
import "./CollapsibleSection.css";

/**
 * CollapsibleSection
 *
 * Generic chevron-based collapsible section used inside trigger cards.
 * Example:
 *   <CollapsibleSection title="Trigger Timing" defaultOpen>
 *     {groups.timing}
 *   </CollapsibleSection>
 */
export function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section">
      <button
        type="button"
        className="collapsible-section-header"
        onClick={() => setOpen(!open)}
      >
        <span className="collapsible-section-title">{title}</span>
        <span
          className={
            "collapsible-section-chevron" + (open ? " open" : "")
          }
        >
          ▾
        </span>
      </button>

      {open && <div className="collapsible-section-body"> <div className='inner'>{children}</div></div>}
    </div>
  );
}
export default CollapsibleSection;