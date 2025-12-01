import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import NotepadPage from "./pages/Notepad";
import HomePage from "./pages/Home";
import "./App.css";
import { HotkeyPage } from "./pages/HotkeyFolder/Hotkeys";
import { Routes, Route, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import ObsPage from "./components/obs-page";
import NotepadOverlay from "./pages/NotepadOverlay";
import { getNotesState, addPage, blankNote } from "./util/NoteOperations";
import { HotKeys } from "react-keyboard";
import TriggerEventsPage from "./pages/TriggerEvents";
import { HotkeyItem } from "./pages/HotkeyFolder/HotkeyItem";
import { useHotkeys } from "react-hotkeys-hook";

function App() {
  // Notes state
  const [notes, setNotes] = useState(getNotesState);
  const [noteText, setNoteText] = useState("");
  const [notePage, setNotePage] = useState(0);

  // Hotkey mapping – new trigger actions can go here
  const [keyMap, setKeyMap] = useState([
    {
      name: "addNotePage",
      hotkey: "alt+p",
      func: () => {
        addPage(notes, setNotes, notePage, setNotePage, noteText);
        console.log("Added new note page");
      },
    },
  ]);

  // Hotkey handlers – new trigger actions can go here too

  const location = useLocation();

  // useHotkeys(keyMap[0].hotkey, keyMap[0].func);
  // console.log("banana", keyMap[0].hotkey, keyMap[0].func)

  return (
    <div id="app">
      {keyMap.map((a) => {
        console.log(a.function, a.hotkey);
        return <HotkeyItem hotkey={a.hotkey} func={a.func}></HotkeyItem>;
      })}

      {location.pathname === "/notepad-overlay" ? null : <Navbar />}
      <div>{notes.length}</div>
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
