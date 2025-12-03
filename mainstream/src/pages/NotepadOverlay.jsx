import { getCurrentNote, retrieveCurrentNoteUpdate } from '../util/NoteOperations';
import { useState, useEffect } from 'react';
import "./NotepadOverlay.css";


export default function NotepadOverlay() {
  const [text, setText] = useState(() => {
    const initialValue = getCurrentNote();
    return initialValue ? initialValue : "";
  });

  useEffect(() => {
    const handleStorageUpdate = (e) => {
      retrieveCurrentNoteUpdate(e, setText);
    }

    window.addEventListener("storage", handleStorageUpdate);

    return () => window.removeEventListener("storage", handleStorageUpdate);
  });

  return (
    <div className="notepad-overlay-bg">
      <div className="notepad-overlay-svg">
        <div className="notepad-overlay-text">
          {text}
        </div>
      </div>
    </div>
  );
}