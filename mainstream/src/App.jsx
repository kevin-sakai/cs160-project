import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NotepadPage from './pages/Notepad'
import HomePage from './pages/Home'
import './App.css'
import { HotkeyPage } from './pages/HotkeyFolder/Hotkeys'
import { Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import ObsPage from "./components/obs-page";
import { getNotesState, addPage, blankNote } from './util/NoteOperations';
import { HotKeys } from 'react-keyboard'
// const pages = {
//   home: {
//     label: "Home",
//     elem: <HomePage />,
//   },
//   notepad: {
//     label: "Notepad",
//     elem: <NotepadPage />,
//   },
//     hotkey: {
//     label: "Hotkeys",
//     elem: <Hotkey />,
//   obs: {
//     label: "OBS Control",
//     elem: <ObsPage />,
//   },
// };


function App() {
  // const [page, setPage] = useState("home");



  const [health, setHealth] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState('');
  const [newSceneName, setNewSceneName] = useState('');
  const [sources, setSources] = useState([]);

  // Notes states
  const [notes, setNotes] = useState(getNotesState);
  const [noteText, setNoteText] = useState("");
  const [notePage, setNotePage] = useState(0);
  //hotkey mapping, title of trigger events should go here
  const [keyMap, setKeyMap] = useState({
    addNotePage: 'alt+p',
    action1: '',
  })
  //hotkey functions, new trigger actions should go here
  const handlers = {
    addNotePage: () => {
      setNotePage((prevItem) => prevItem + 1);
      setNotes((prevItem) => [...prevItem, blankNote()])
      console.log(`Added: ${newPage}`)
    },

  }
  return (
    <HotKeys keyMap={keyMap} handlers={handlers}>
      <div id="app">

        {/* <div id="sidebar">
        <h2>MainStream</h2>
        {Object.entries(pages).map(([pageId, pageConfig]) => (
          <SidebarButton
            key={pageId}
            pageId={pageId}
            label={pageConfig.label}
            setPage={setPage}
          />
        ))}

      </div> */}
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notepad"
            element={<NotepadPage
              notes={notes}
              setNotes={setNotes}
              noteText={noteText}
              setNoteText={setNoteText}
              notePage={notePage}
              setNotePage={setNotePage}
            />} />
          <Route path="/hotkeys" element={<HotkeyPage keyMap={keyMap} setKeyMap={setKeyMap} />} />
          <Route path="/obspage" element={<ObsPage />} />
        </Routes>
        <div id="main-page">
          {/* {pages[page].elem} */}
          {/* {pages[page] ? pages[page].elem : <div>Page not found</div>} */}
        </div>
      </div>
    </HotKeys>
  );
}



function SidebarButton({ pageId, label, setPage }) {
  return (
    <div>
      <button className="sidebar-button" onClick={() => setPage(pageId)}>
        {label}
      </button>

    </div>
  );
}

export default App
