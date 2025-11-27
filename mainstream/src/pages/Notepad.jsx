import { useState, useEffect } from 'react';
import './Notepad.css';
import { updateCurrentNote, updateNotes, addPage, changePage, deletePage, storeCurrentNote } from '../util/NoteOperations';
import { getNextPart } from '../util/StoryGenerator';
import { Link } from "react-router-dom"

const NUM_TEXT_ROWS = 15;
const HISTORY_MAX = 5;

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

  return (
    <div id="notepad-page">
      <div id="title">
        <h1>Notepad</h1>
      </div>
      {null && <NoteEditor
        notes={notes}
        setNotes={setNotes}
        noteText={noteText}
        setNoteText={setNoteText}
        notePage={notePage}
        setNotePage={setNotePage}
      />}
      <NoteStory
        noteText={noteText}
        setNoteText={setNoteText}
      />
      <Link to='/notepad-overlay'><li>Open Overlay</li></Link>
    </div>
  );
}

function NoteEditor({ notes, setNotes, noteText, setNoteText, notePage, setNotePage }) {
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
      <h1>{notes[notePage].date}</h1>
    </div>
  );
}

function NoteStory({ noteText, setNoteText }) {
  const typingSpeed = 25;

  const [textBuffer, setTextBuffer] = useState("");
  const [storyHistory, setStoryHistory] = useState([]);
  const [theme, setTheme] = useState("");

  useEffect(() => {
    setNoteText("");

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < textBuffer.length) {
        const nextChar = textBuffer[i];
        setNoteText((prev) => prev + nextChar);
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typingInterval);
  }, [textBuffer]);

  useEffect(() => {
    storeCurrentNote(noteText);
  }, [noteText]);

  getNextPart();

  useEffect(() => {
    const msgHandler = async (msg) => {
      if (!theme || !msg) {
        return;
      }
      const mergedHistory = storyHistory.join(" ");
      const history = mergedHistory ? mergedHistory : "None, the story begins here.";
      try {
        const response = await getNextPart(theme, history, msg);
        setTextBuffer(response);
        updateHistory(setHistory, response);
      } catch (e) {
        console.log(e);
      }
    }
  }, []);

  return (
    <div id="notepad-text-entry">
      <textarea
        value={noteText}
        rows={NUM_TEXT_ROWS}
        readOnly>
      </textarea>
    </div>
  );
}

function updateHistory(setHistory, nextChunk) {
  setHistory((prev) => {
    if (prev.length < HISTORY_MAX - 1) {
      return [...prev, nextChunk];
    } else {
      return [...prev.slice(1), nextChunk];
    }
  });
}