import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NotepadPage from './pages/Notepad'
import HomePage from './pages/Home'
import './App.css'
import { Hotkey } from './pages/HotkeyFolder/Hotkeys'
import { Routes, Route } from 'react-router-dom'
const pages = {
  home: {
    label: "Home",
    elem: <HomePage />,
  },
  notepad: {
    label: "Notepad",
    elem: <NotepadPage />,
  },
    hotkey: {
    label: "Hotkeys",
    elem: <Hotkey />,
  },
};

function App() {
  const [page, setPage] = useState("home");
  return (
    <div id="app">
      <div id="sidebar">
        <h2>MainStream</h2>
        {Object.entries(pages).map(([pageId, page]) => (
          <SidebarButton key={pageId} pageId={pageId} label={page.label} setPage={setPage} />
        ))}
      </div>
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/notepad" element={<NotepadPage/>}/>
          <Route path="/hotkeys" element={<Hotkey/>}/>
          </Routes>
      <div id="main-page">
        {pages[page].elem}
      </div>
    </div>
  );
}

function Navbar() {
  return(
    <div>
      <ul>
      <li>Home</li>
      <li>Notebook</li>
      <li>Hotkeys</li>
    </ul>
    </div>)
}

function SidebarButton({pageId, label, setPage}) {
  return (
    <div>
    <button className="sidebar-button" onClick={() => setPage(pageId)}>
      {label}
    </button>

    </div>
  );
}

export default App
