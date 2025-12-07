import { getCurrentNote, retrieveCurrentNoteUpdate } from '../util/NoteOperations';
import { useState, useEffect } from 'react';
import "./NotepadOverlay.css";
import { socket } from './Notepad';

export default function NotepadOverlay() {
  const [text, setText] = useState("Waiting for server...");

  useEffect(() => {
    socket.on('text_update', (data) => {
        setText(data.text);
    });

    return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('text_update');
    };
  }, []);

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