import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NotepadPage from './pages/Notepad'
import HomePage from './pages/Home'
import './App.css'
import ObsPage from "./components/obs-page";

const pages = {
  home: {
    label: "Home",
    elem: <HomePage />,
  },
  notepad: {
    label: "Notepad",
    elem: <NotepadPage />,
  },
  obs: {
    label: "OBS Control",
    elem: <ObsPage />,
  },
};

function App() {
  const [page, setPage] = useState("home");
  const [health, setHealth] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState('');
  const [newSceneName, setNewSceneName] = useState('');
  const [sources, setSources] = useState([]);
  

  return (
    <div id="app">
      <div id="sidebar">
        <h2>MainStream</h2>
        {Object.entries(pages).map(([pageId, pageConfig]) => (
          <SidebarButton
            key={pageId}
            pageId={pageId}
            label={pageConfig.label}
            setPage={setPage}
          />
        ))}
      </div>
      <div id="main-page">
        {pages[page] ? pages[page].elem : <div>Page not found</div>}
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
