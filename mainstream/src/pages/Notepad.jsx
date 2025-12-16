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
import { io } from 'socket.io-client';
import { connectTwitchChat, disconnectTwitchChat } from '../api/obs';

const WEBSOCKET_SERVER = 'http://localhost:3000';
export const socket = io(WEBSOCKET_SERVER);

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
  const [fontColor, setFontColor] = useState("#373670");


  useEffect(() => {
    socket.emit('text_input', { text: noteText });
  }, [noteText])

  useEffect(() => {
    socket.emit('color_change', { color: fontColor });
  }, [fontColor])

  useEffect(() => {
    connectTwitchChat();
    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
      disconnectTwitchChat();
    };
  }, []);

  const tabs = {
    edit: {
      label: "Create Notes",
      elem: <NoteEditor
              notes={notes}
              setNotes={setNotes}
              noteText={noteText}
              setNoteText={setNoteText}
              notePage={notePage}
              setNotePage={setNotePage} />,
      tip: "The Standard note editor. Create new notes, view or edit existing notes.",
    },
    story: {
      label: "Generate A Story",
      elem: <NoteStory
              noteText={noteText}
              setNoteText={setNoteText} />,
      tip: "Automatically generate a story based on chat activity and populate the notepad with the story.",
    },
    suggest: {
      label: "Get Suggestions",
      elem: <NoteSuggestions
              noteText={noteText}
              setNoteText={setNoteText} />,
      tip: "Get suggestions based on chat activity for topics or questions, then choose a suggestion to display.",
    },
  };

  return (
    <div id="notepad-page">
      <div id="title">
        <h1>Notepad</h1>
      </div>
      <div id="notepad-tabs">
        {Object.entries(tabs).map(([tabId, {label, elem, tip}]) => (
          <NotepadTab
            key={tabId}
            tabId={tabId}
            tabLabel={label}
            tooltip={tip}
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        ))}
      </div>
      <div className="notepad-main">
        {tabs[currentTab].elem}
        <div className="colorcontainer">
          <HexColorPicker color={fontColor} onChange={setFontColor} />
          <div className="colordisplay">
            <p id="fontcolorp">Font Color:</p>
            <HexColorInput id="colorinput" color={fontColor} onChange={setFontColor} />
          </div>
          <div className="textcolorsample" style={{ color: fontColor }}>
            Sample Text
          </div>
        </div>
      </div>
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

  return (
    <div id="notepad-tab-area">
      <div className="textcontainer">
        <textarea
          value={noteText}
          onChange={(e) => updateCurrentNote(setNoteText, e.target.value)}
          placeholder="Start Writing A Note!"
          rows={NUM_TEXT_ROWS}
        ></textarea>
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

function NotepadTab({ tabId, tabLabel, tooltip, currentTab, setCurrentTab }) {
  return (
    <button className={`tooltip notepad-tab${tabId === currentTab ? " active" : ""}`} onClick={() => setCurrentTab(tabId)}>
      {tabLabel}
      <span className="tooltiptext">{tooltip}</span>
    </button>
  );
}

function NoteStory({ noteText, setNoteText }) {
  const typingSpeed = 50;

  const [textBuffer, setTextBuffer] = useState("");
  const [storyHistory, setStoryHistory] = useState([]);
  const [theme, setTheme] = useState("");
  const [msgBuffer, setMsgBuffer] = useState([]);
  const [generateInterval, setGenerateInterval] = useState(5);

  useEffect(() => {
    const eventName = 'new_chat_message';

    const handleMsg = (data) => {
      const msg = data.msg;
      console.log(`got msg ${msg}`);
      setMsgBuffer((prev) => [...prev, msg]);
    };

    socket.on(eventName, handleMsg);

    return () => {
      socket.off(eventName, handleMsg);
    };

  }, []);

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

  useEffect(() => {
    if (msgBuffer.length >= generateInterval) {
      sendStoryRequest(msgBuffer);
    }
  }, [msgBuffer]);

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
      <p>
        Generate every
        <input
          className="generate-interval-input"
          type="text"
          value={generateInterval}
          onChange={(e) => setGenerateInterval(e.target.value)} /> 
        messages.
      </p>
    </div>
  );
}

function NoteSuggestions({ noteText, setNoteText }) {
  const typingSpeed = 50;

  const [textBuffer, setTextBuffer] = useState("");
  const [msgBuffer, setMsgBuffer] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const eventName = 'new_chat_message';

    const handleMsg = (data) => {
      const msg = data.msg;
      console.log(`got msg ${msg}`);
      setMsgBuffer((prev) => [...prev, msg]);
    };

    socket.on(eventName, handleMsg);

    return () => {
      socket.off(eventName, handleMsg);
    };

  }, []);

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

  async function sendSuggestionRequest(msgBuf) {
    const messages = formatMessages(msgBuf);
    try {
      setLoading(true);
      const response = await getSuggestion(messages);
      const parsedResponse = JSON.parse(response);
      setSuggestions(parsedResponse);
      console.log(parsedResponse);
      setMsgBuffer([]);
      setLoading(false);
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
      <button
        onClick={() => {
          sendSuggestionRequest(msgBuffer, setSuggestions);
        }}
      >
        Get Suggestions
      </button>
      {loading ? (<p>Loading...</p>) : null}
      {suggestions ? (
        <SuggestionList
          suggestions={suggestions}
          setTextBuffer={setTextBuffer}
          setSuggestions={setSuggestions} />) : null}
    </div>
  );
}

function SuggestionList({ suggestions, setTextBuffer, setSuggestions }) {
  return (
    <div className="suggestion-choices">
      {Object.values(suggestions).map((suggestion) =>
        (<SuggestionItem suggestion={suggestion}
          setTextBuffer={setTextBuffer}
          setSuggestions={setSuggestions} />))}
    </div>
  )
}

function SuggestionItem({ suggestion, setTextBuffer, setSuggestions }) {
  return (
    <button onClick={() => {
      setTextBuffer(suggestion);
      setSuggestions(null);
    }}>{suggestion}</button>
  )
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
