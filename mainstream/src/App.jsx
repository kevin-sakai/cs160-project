import { useState, useEffect, useRef } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import NotepadPage from "./pages/Notepad";
import HomePage from "./pages/Home";
import "./App.css";
import { HotkeyPage } from "./pages/HotkeyFolder/Hotkeys";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import ObsPage from "./components/obs-page";
import NotepadOverlay from "./pages/NotepadOverlay";
import { getNotesState, addPage, blankNote } from "./util/NoteOperations";
import { HotKeys } from "react-keyboard";
import TriggerEventsPage from "./pages/TriggerEvents";
import { HotkeyItem } from "./pages/HotkeyFolder/HotkeyItem";
import { useHotkeys } from "react-hotkeys-hook";
import { getItem, setItem } from "./util/HotkeyLocalStorage";

function App() {
  // Notes state
  const [notes, setNotes] = useState(getNotesState);
  const [noteText, setNoteText] = useState("");
  const [notePage, setNotePage] = useState(0);
  const notesRef = useRef(notes);
  const noteTextRef = useRef(noteText);
  const notePageRef = useRef(notePage);
  const navigate = useNavigate(); 

  // Hotkey mapping start block – new trigger actions can go here

  const [handlers, setHandlers] = useState({
    addNotePage: () => {
      addPage(notesRef.current, setNotes, notePageRef.current, setNotePage, noteTextRef.current);
      console.log("Added new note page");
    },
    action2: () => {
      console.log("pressed b");
    },
    openTriggerEventsPage: () => {
      //navigate("/TriggerEventsPage");
      console.log("Navigating to Trigger Events Page");
    },
    activateTimedEventsTrigger: () => {
      navigate("/TriggerEventsPage", { state: { initialTrigger: "timed" } });
    },
    activateClickTrigger: () => {
      navigate("/TriggerEventsPage", { state: { initialTrigger: "click" } });
    },
    activateFollowerTrigger: () => {
      navigate("/TriggerEventsPage", { state: { initialTrigger: "followers" } });
    },
    activateBanningTrigger: () => {
      navigate("/TriggerEventsPage", { state: { initialTrigger: "banning" } });
    },
    activateSentimentTrigger: () => {
      navigate("/TriggerEventsPage", { state: { initialTrigger: "sentiment" } });
    },
  });
  const [keyMap, setKeyMap] = useState(() => {
    const item = getItem("keyMap");
  
    //const item = null;
    return (
      item || [
        {
          name: "Add Notepad page",
          hotkey: "alt+p",
          funcname: "addNotePage",
        },

        {
          name: "Action 2",
          hotkey: "b",
          funcname: "action2",
        },
        // Adding the Trigger Events page hotkey by default
        { 
          name: "Open Trigger Events Page",
          hotkey: "", 
          funcname: "openTriggerEventsPage",
        },
        // Add the Timed Events Trigger hotkey by default
        {
          name: "Activate Timed Events Trigger",
          hotkey: "",
          funcname: "activateTimedEventsTrigger",
        },
        // Add the Click Trigger hotkey by default
        {
          name: "Activate Click Trigger",
          hotkey: "",
          funcname: "activateClickTrigger",
        },
        // Add the Follower Trigger hotkey by default
        {
          name: "Activate Follower Trigger",
          hotkey: "",
          funcname: "activateFollowerTrigger",
        },
        // Add the Banning Trigger hotkey by default
        {
          name: "Activate Banning Trigger",
          hotkey: "",
          funcname: "activateBanningTrigger",
        },
        // Add the Sentiment Trigger hotkey by default
        {
          name: "Activate Sentiment Trigger",
          hotkey: "",
          funcname: "activateSentimentTrigger",
        },
      ]
    );
  });
  // just do "" for the tri

  useEffect(() => {

    setItem("keyMap", keyMap);
  }, [keyMap]);

  // Ref updates for hotkey functions
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  useEffect(() => {
    noteTextRef.current = noteText;
  }, [noteText]);
  useEffect(() => {
    notePageRef.current = notePage;
  }, [notePage]);

  // Hotkey mappings end block

  const location = useLocation();



  return (
    <div id="app">
      {keyMap.map((a) => {
 
        return (
          <HotkeyItem
            hotkey={a.hotkey}
            func={handlers[a.funcname]}
          ></HotkeyItem>
        );
      })}

      {location.pathname === "/notepad-overlay" ? null : <Navbar />}

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/notepad"
          element={
            <NotepadPage
              notes={notes}
              setNotes={setNotes}
              noteText={noteText}
              setNoteText={setNoteText}
              notePage={notePage}
              setNotePage={setNotePage}
            />
          }
        />

        <Route
          path="/hotkeys"
          element={<HotkeyPage keyMap={keyMap} setKeyMap={setKeyMap} />}
        />

        <Route path="/obspage" element={<ObsPage />} />

        {/* new Trigger Events page */}
        <Route path="/TriggerEventsPage" element={<TriggerEventsPage />} />

        <Route path="/notepad-overlay" element={<NotepadOverlay />} />
      </Routes>

      {/* main-page div is still here if you’re styling around it */}
      <div id="main-page" />
    </div>
  );
}

export default App;
