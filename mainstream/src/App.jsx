// src/App.jsx
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
import { ObsProvider } from "./api/obsData";

function App() {
  // Notes state
  const [notes, setNotes] = useState(getNotesState);
  const [noteText, setNoteText] = useState("");
  const [notePage, setNotePage] = useState(0);
  const notesRef = useRef(notes);
  const noteTextRef = useRef(noteText);
  const notePageRef = useRef(notePage);
  const navigate = useNavigate();

  // --- Signal for TriggerEvents to "click Done" ---
  // TriggerEventsPage will register a handler here.
  // App will call requestTriggerEventsDoneClick(triggerType)
  // when one of the hotkeys fires.
  const doneClickRequestRef = useRef(null);

  const requestTriggerEventsDoneClick = (triggerType) => {
    if (typeof doneClickRequestRef.current === "function") {
      doneClickRequestRef.current(triggerType);
    } else {
      console.log(
        "Done-click handler not registered yet; ignoring request for triggerType:",
        triggerType
      );
    }
  };

  // Hotkey mapping start block – new trigger actions can go here
  const [handlers, setHandlers] = useState({
    addNotePage: () => {
      addPage(
        notesRef.current,
        setNotes,
        notePageRef.current,
        setNotePage,
        noteTextRef.current
      );
      console.log("Added new note page");
    },
    action2: () => {
      console.log("pressed key");
    },
    action3: () => {
      console.log("pressed key");
    },
    action4: () => {
      console.log("pressed key");
    },
    // Generic open Trigger Events page
    openTriggerEventsPage: () => {
      navigate("/TriggerEventsPage");
      // Hotkey should "click Done" if appropriate
      requestTriggerEventsDoneClick(null);
    },

    // Timed Events Trigger hotkey
    activateTimedEventsTrigger: () => {
      navigate("/TriggerEventsPage", { state: { initialTrigger: "timed" } });
      requestTriggerEventsDoneClick("timed");
    },

    // Click Trigger hotkey
    activateClickTrigger: () => {
      navigate("/TriggerEventsPage", { state: { initialTrigger: "click" } });
      requestTriggerEventsDoneClick("click");
    },

    // Follower Trigger hotkey
    activateFollowerTrigger: () => {
      navigate("/TriggerEventsPage", {
        state: { initialTrigger: "followers" },
      });
      requestTriggerEventsDoneClick("followers");
    },

    // Banning Trigger hotkey
    activateBanningTrigger: () => {
      navigate("/TriggerEventsPage", { state: { initialTrigger: "banning" } });
      requestTriggerEventsDoneClick("banning");
    },

    // Sentiment Trigger hotkey
    activateSentimentTrigger: () => {
      navigate("/TriggerEventsPage", {
        state: { initialTrigger: "sentiment" },
      });
      requestTriggerEventsDoneClick("sentiment");
    },
  });

  const [keyMap, setKeyMap] = useState(() => {
    const item = getItem("keyMap");

    return (
      item || [
        {
          name: "Add Notepad page",
          hotkey: "alt+p",
          funcname: "addNotePage",
        },

        {
          name: "Action 2",
          hotkey: "a",
          funcname: "action2",
        },
                {
          name: "Action 3",
          hotkey: "b",
          funcname: "action2",
        },
                {
          name: "Action 4",
          hotkey: "c",
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

  const location = useLocation();
  const hiddenNavbarPages = ["/notepad-overlay"];

  return (
    <div id="app">
      <ObsProvider>
        {keyMap.map((a, index) => {
          return (
            <HotkeyItem
              key={a.funcname || a.name || index}
              hotkey={a.hotkey}
              func={handlers[a.funcname]}
            />
          );
        })}

        {hiddenNavbarPages.includes(location.pathname) ? null : <Navbar />}

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
          <Route
            path="/TriggerEventsPage"
            element={
              <TriggerEventsPage
                registerDoneHandler={(fn) => {
                  // fn should be something like (triggerType) => { ... }
                  doneClickRequestRef.current = fn;
                }}
              />
            }
          />

          <Route path="/notepad-overlay" element={<NotepadOverlay />} />
        </Routes>
      </ObsProvider>
    </div>
  );
}

export default App;
