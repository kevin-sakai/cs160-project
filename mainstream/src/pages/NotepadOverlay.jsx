import { getCurrentNote, retrieveCurrentNoteUpdate } from '../util/NoteOperations';
import { useState, useEffect } from 'react';


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
    <div>
      <h2>Notes</h2>
      <div>{text}</div>
    </div>
  );
}