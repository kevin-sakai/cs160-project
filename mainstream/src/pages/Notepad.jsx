import { useState, useEffect } from 'react';
import './Notepad.css';

const NUM_TEXT_ROWS = 15;
const LOCALSTORAGE_KEY = "mainstream-notes";

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

const formattedDate = `${daysOfWeek[dayOfWeek]}, ${months[month]} ${day}, ${year}`;

function blankNote() {
  return {
    date: formattedDate,
    text: "",
  }
};

// key: pagenum
// {date: <date last modified>, text: <note text>}

export default function Notepad() {
  const [noteText, setNoteText] = useState("");
  const [notePage, setNotePage] = useState(0);
  const [noteDate, setNoteDate] = useState("");
  const [notes, setNotes] = useState(() => {
    const localNotes = localStorage.getItem(LOCALSTORAGE_KEY);
    return localNotes ? JSON.parse(localNotes) : [blankNote()];
  });

  useEffect(() => {
    const keystrokeTimer = setTimeout(() => {
      updateNotes(notes, setNotes, notePage, noteText);
    }, 500);

    return () => clearTimeout(keystrokeTimer);
  }, [noteText]);

  useEffect(() => {
    setNoteText(notes[notePage].text);
  }, [notePage, notes]);

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

function updateNotes(notes, setNotes, currPage, noteText) {
  setNotes(oldNotes => 
    oldNotes.map((note, index) =>
      index === currPage ? {date: note.date, text: noteText} : note
    )
  );
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(notes));
}

function changePage(notes, setNotes, currPage, targetPage, setNotePage, numPages, noteText) {
  updateNotes(notes, setNotes, currPage, noteText);
  if (targetPage >= numPages || targetPage < 0) {
    return;
  }
  setNotePage(targetPage);
}

function addPage(notes, setNotes, currPage, setNotePage, noteText) {
  updateNotes(notes, setNotes, currPage, noteText);
  const newPageNum = notes.length;
  setNotes(oldNotes => [...oldNotes, blankNote()]);
  setNotePage(newPageNum);
}

function deletePage(notes, setNotes, currPage, setNotePage) {
  const newPageNum = currPage === 0 ? currPage : currPage - 1;
  if (notes.length === 1) {
    setNotes([blankNote()]);
  } else {
    setNotes(oldNotes =>
      oldNotes.filter((elem, index) =>
        index !== currPage
      )
    )
  }
  setNotePage(newPageNum);
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(notes));
}