import { useState, useEffect } from 'react';
import './Notepad.css';
import { updateCurrentNote, updateNotes, addPage, changePage, deletePage } from '../util/NoteOperations';

const NUM_TEXT_ROWS = 15;

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

// key: pagenum
// {date: <date last modified>, text: <note text>}

export default function Notepad({ notes, setNotes, noteText, setNoteText, notePage, setNotePage }) {
  const [noteDate, setNoteDate] = useState("");

  useEffect(() => {
    const keystrokeTimer = setTimeout(() => {
      updateNotes(notes, setNotes, notePage, noteText);
    }, 500);

    return () => clearTimeout(keystrokeTimer);
  }, [noteText]);

  useEffect(() => {
    updateCurrentNote(setNoteText, notes[notePage].text)
  }, [notePage, notes]);

  return (
    <div id="notepad-page">
      <div id="title">
        <h1>Notepad</h1>
      </div>
      <div id="notepad-text-entry">
          <textarea
            value={noteText}
            onChange={(e) => updateCurrentNote(setNoteText, e.target.value)}
            placeholder="Start Writing A Note!"
            rows={NUM_TEXT_ROWS}>
          </textarea>
          <div id="notepad-page-buttons">
            <button
              className="notepad-page-button"
              onClick={() => changePage(notes, setNotes, notePage, notePage - 1, setNotePage, notes.length, noteText)}>&#x2190;</button>
            <button
              className="notepad-page-button"
              onClick={() => changePage(notes, setNotes, notePage, notePage + 1, setNotePage, notes.length, noteText)}>&#x2192;</button>
            <button
              className="notepad-page-button"
              onClick={() => addPage(notes, setNotes, notePage, setNotePage, noteText)}>New Note</button>
            <button
              className="notepad-page-button"
              onClick={() => deletePage(notes, setNotes, notePage, setNotePage)}>Delete</button>
          </div>
          <h2>Page {notePage}</h2>
          <h1>{noteDate}</h1>
        </div>
    </div>
  );
}