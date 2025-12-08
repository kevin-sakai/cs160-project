import { useState, useEffect } from "react";
import "./Notepad.css";
import {
  updateCurrentNote,
  updateNotes,
  addPage,
  changePage,
  deletePage,
  storeCurrentNote,
} from "../util/NoteOperations";
import { getNextPart, getSuggestion } from "../util/StoryGenerator";
import { Link } from "react-router-dom";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { color } from "chart.js/helpers";

const NUM_TEXT_ROWS = 15;
const HISTORY_MAX = 5;

// key: pagenum
// {date: <date last modified>, text: <note text>}

export default function Notepad({
  notes,
  setNotes,
  noteText,
  setNoteText,
  notePage,
  setNotePage,
}) {
  const [currentTab, setCurrentTab] = useState("edit");

  const tabs = {
    edit: {
      label: "Create Notes",
      elem: (
        <NoteEditor
          notes={notes}
          setNotes={setNotes}
          noteText={noteText}
          setNoteText={setNoteText}
          notePage={notePage}
          setNotePage={setNotePage}
        />
      ),
    },
    story: {
      label: "Generate A Story",
      elem: <NoteStory noteText={noteText} setNoteText={setNoteText} />,
    },
    suggest: {
      label: "Get Suggestions",
      elem: <NoteSuggestions noteText={noteText} setNoteText={setNoteText} />,
    },
  };

  return (
    <div id="notepad-page">
      <div id="title">
        <h1>Notepad</h1>
      </div>
      <div id="notepad-tabs">
        {Object.entries(tabs).map(([tabId, { label, elem }]) => (
          <NotepadTab
            key={tabId}
            tabId={tabId}
            tabLabel={label}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        ))}
      </div>
      {tabs[currentTab].elem}
      <Link id="overlay-link" to="/notepad-overlay">
        Open Overlay
      </Link>
    </div>
  );
}

function NoteEditor({
  notes,
  setNotes,
  noteText,
  setNoteText,
  notePage,
  setNotePage,
}) {
  useEffect(() => {
    const keystrokeTimer = setTimeout(() => {
      updateNotes(notes, setNotes, notePage, noteText);
    }, 500);

    return () => clearTimeout(keystrokeTimer);
  }, [noteText]);

  useEffect(() => {
    updateCurrentNote(setNoteText, notes[notePage].text);
  }, [notePage, notes]);

  const [fontColor, setFontColor] = useState("#373670");
  return (
    <div id="notepad-tab-area">
      <div className="textcontainer">
        <textarea
          style={{ color: fontColor }}
          value={noteText}
          onChange={(e) => updateCurrentNote(setNoteText, e.target.value)}
          placeholder="Start Writing A Note!"
          rows={NUM_TEXT_ROWS}
        ></textarea>
        <div className="colorcontainer">
        <HexColorPicker color={fontColor} onChange={setFontColor} />
                <p id="fontcolorp">Font Color:</p>
        <HexColorInput id="colorinput" color={fontColor} onChange={setFontColor} />

        </div>
      </div>
      <div id="notepad-page-buttons">
        <button
          className="notepad-page-button"
          onClick={() =>
            changePage(
              notes,
              setNotes,
              notePage,
              notePage - 1,
              setNotePage,
              notes.length,
              noteText
            )
          }
        >
          &#x2190;
        </button>
        <button
          className="notepad-page-button"
          onClick={() =>
            changePage(
              notes,
              setNotes,
              notePage,
              notePage + 1,
              setNotePage,
              notes.length,
              noteText
            )
          }
        >
          &#x2192;
        </button>
        <button
          className="notepad-page-button"
          onClick={() =>
            addPage(notes, setNotes, notePage, setNotePage, noteText)
          }
        >
          New Note
        </button>
        <button
          className="notepad-page-button"
          onClick={() => deletePage(notes, setNotes, notePage, setNotePage)}
        >
          Delete
        </button>
      </div>
      <h2>
        Page {notePage + 1}/{notes.length}
      </h2>
      <h2>{notes[notePage].date}</h2>
    </div>
  );
}

function NotepadTab({ tabId, tabLabel, currentTab, setCurrentTab }) {
  return (
    <button
      className={tabId === currentTab ? "notepad-tab active" : "notepad-tab"}
      onClick={() => setCurrentTab(tabId)}
    >
      {tabLabel}
    </button>
  );
}

function NoteStory({ noteText, setNoteText }) {
  const typingSpeed = 50;

  const [textBuffer, setTextBuffer] = useState("");
  const [storyHistory, setStoryHistory] = useState([]);
  const [theme, setTheme] = useState("");
  const [msgBuffer, setMsgBuffer] = useState([]);

  const tmpMsgBuffer = [
    "What's up?",
    "I just beat this game yesterday, how far are you?",
    "I can't believe you survived that attack...",
    "Huh what game is this??",
    "Actually you're not using that weapon correctly",
    "Where did you find that item?",
    "Seriously you're still playing this game?",
  ];

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

  useEffect(() => {
    if (noteText.length > 300) {
      setNoteText((prev) => "..." + prev.slice(43));
    }
  }, [noteText]);

  async function sendStoryRequest(msgBuffer) {
    if (!theme || !msgBuffer) {
      return;
    }
    const mergedHistory = storyHistory.join(" ");
    const history = mergedHistory
      ? mergedHistory
      : "None, the story begins here.";
    const messages = formatMessages(msgBuffer);
    try {
      const response = await getNextPart(theme, history, messages);
      setTextBuffer(response);
      updateHistory(setStoryHistory, response);
      setMsgBuffer([]);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div id="notepad-tab-area">
      <textarea
        className="no-input"
        tabIndex={-1}
        value={noteText}
        rows={NUM_TEXT_ROWS}
        readOnly
      ></textarea>
      <label htmlFor="theme-input">Theme:</label>
      <input
        type="text"
        name="theme-input"
        placeholder="Enter theme..."
        onChange={(e) => setTheme(e.target.value)}
      />
      <button
        className="generate-button"
        onClick={() => {
          sendStoryRequest(tmpMsgBuffer);
        }}
      >
        Generate
      </button>
    </div>
  );
}

function NoteSuggestions({ noteText, setNoteText }) {
  const typingSpeed = 25;

  const [textBuffer, setTextBuffer] = useState("");
  const [msgBuffer, setMsgBuffer] = useState([]);
  const [suggestions, setSuggestions] = useState(null);

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

  async function sendSuggestionRequest(msgBuf, setSuggest) {
    const messages = formatMessages(msgBuf);
    try {
      const response = await getSuggestion(messages);
      const parsedResponse = JSON.parse(response);
      setSuggest(parsedResponse);
      console.log(parsedResponse);
      setMsgBuffer([]);
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div id="notepad-tab-area">
      <button
        onClick={() => {
          sendSuggestionRequest(msgBuffer, setSuggestions);
        }}
      >
        Generate!
      </button>
      <textarea
        className="no-input"
        tabIndex={-1}
        value={noteText}
        rows={NUM_TEXT_ROWS}
        readOnly
      ></textarea>
      <label htmlFor="theme-input">Theme:</label>
      <input
        type="text"
        name="theme-input"
        placeholder="Enter theme..."
        onChange={(e) => setTheme(e.target.value)}
      />
    </div>
  );
}

function formatMessages(msgBuffer) {
  return msgBuffer
    ? msgBuffer.map((msg, index) => `Message ${index + 1}: ${msg}`).join("\n")
    : "";
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
