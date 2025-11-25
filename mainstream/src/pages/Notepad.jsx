import { useState, useEffect } from 'react';
import './Notepad.css';

const NUM_TEXT_ROWS = 15;

const date = new Date();
const day = date.getDate();
const month = date.getMonth();
const year = date.getFullYear();
const dayOfWeek = date.getDay();

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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
    const formattedDate = `${daysOfWeek[dayOfWeek]}, ${months[month]} ${day}, ${year}`;
    const item = JSON.stringify({
      date: formattedDate,
      text: noteText,
    });
    localStorage.setItem(key, item);
  }, [noteText]);

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
            <button
              className="notepad-page-button"
              >Delete</button>
          </div>
          <h2>Page {notePage}</h2>
          <h1>{noteDate}</h1>
        </div>
    </div>
  );
}