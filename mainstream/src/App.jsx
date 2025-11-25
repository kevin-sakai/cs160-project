import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NotepadPage from './pages/Notepad'
import HomePage from './pages/Home'
import './App.css'

const pages = {
  home: {
    label: "Home",
    elem: <HomePage />,
  },
  notepad: {
    label: "Notepad",
    elem: <NotepadPage />,
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
      <div id="main-page">
        {pages[page].elem}
      </div>
    </div>
  );
}

function SidebarButton({pageId, label, setPage}) {
  return (
    <button className="sidebar-button" onClick={() => setPage(pageId)}>
      {label}
    </button>
  );
}

export default App
