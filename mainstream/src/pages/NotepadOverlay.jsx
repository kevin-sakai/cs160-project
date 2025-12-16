import { getCurrentNote, retrieveCurrentNoteUpdate } from '../util/NoteOperations';
import { useState, useEffect } from 'react';
import "./NotepadOverlay.css";
import { io } from 'socket.io-client';

const WEBSOCKET_SERVER = 'http://localhost:3000';

export default function NotepadOverlay() {
  const [text, setText] = useState("Waiting for server...");
  const [fontColor, setFontColor] = useState("#373670");

  useEffect(() => {
    const socket = io(WEBSOCKET_SERVER);
    socket.on('text_update', (data) => {
        setText(data.text);
    });

    socket.on('color_update', (data) => {
        setFontColor(data.color);
    });

    return () => {
      if (socket.connected) {
        socket.off('text_update');
        socket.off('color_update');
        socket.disconnect();
      }
    };
  }, []);

  return (
    <div className="notepad-overlay-bg">
      <div className="notepad-overlay-svg">
        <div className="notepad-overlay-text" style={{ color: fontColor }}>
          {text}
        </div>
      </div>
    </div>
  );
}