import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NotepadPage from './pages/Notepad'
import HomePage from './pages/Home'
import './App.css'
import { HotkeyPage } from './pages/HotkeyFolder/Hotkeys'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import ObsPage from "./components/obs-page";
import NotepadOverlay from './pages/NotepadOverlay';
import { getNotesState, addPage, blankNote } from './util/NoteOperations';
import { HotKeys } from 'react-keyboard'
import TriggerEventsPage from './pages/TriggerEvents';


function App() {
  // Notes state
  const [notes, setNotes] = useState(getNotesState);
  const [noteText, setNoteText] = useState('');
  const [notePage, setNotePage] = useState(0);

  // Hotkey mapping – new trigger actions can go here
  const [keyMap, setKeyMap] = useState({
    addNotePage: 'alt+p',
    action1: '',
  });

  // Hotkey handlers – new trigger actions can go here too
  const handlers = {
    addNotePage: () => {
      setNotePage((prevItem) => prevItem + 1);
      setNotes((prevItem) => [...prevItem, blankNote()]);
      console.log('Added new note page');
    },
  };

  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <div id="app">
        <Navbar />

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
        </Routes>

        {/* main-page div is still here if you’re styling around it */}
        <div id="main-page" />
      </div>
    </HotKeys>
  );
}

export default App;