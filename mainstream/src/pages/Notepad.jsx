import { useState, useEffect } from 'react';
import './Notepad.css';

const NUM_TEXT_ROWS = 25;

// localStorage key scheme: mainstream-<pagenum>
// {date: <date last modified>, text: <note text>}

export default function Notepad() {
  const [noteText, setNoteText] = useState("");
  const [notePage, setNotePage] = useState(0);
  const [noteDate, setNoteDate] = useState("");

  useEffect(() => {
    const key = "mainstream-" + notePage;
    const entry = JSON.parse(localStorage.getItem(key));
    if (entry) {
      setNoteText(entry.text);
      setNoteDate(entry.date);
    }
  }, [notePage]);

  useEffect(() => {
    const key = "mainstream-" + notePage;
    const item = JSON.stringify({
      date: "1-1-1",
      text: noteText,
    });
    localStorage.setItem(key, item);
  })

  return (
    <div id="notepad-page">
      <div id="title">
        <h1>Notepad</h1>
      </div>
      <div id="notepad-text-entry">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Start Writing A Note!"
            rows={NUM_TEXT_ROWS}>
          </textarea>
          <div id="notepad-page-buttons">
            <button
              className="notepad-page-button"
              onClick={() => setNotePage(notePage - 1)}>&#x2190;</button>
            <button
              className="notepad-page-button"
              onClick={() => setNotePage(notePage + 1)}>&#x2192;</button>
          </div>
          <h2>Page {notePage}</h2>
        </div>
    </div>
  );
}