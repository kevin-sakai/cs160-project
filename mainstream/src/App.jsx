import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import NotepadPage from './pages/Notepad'
import HomePage from './pages/Home'
import './App.css'
import { Hotkey } from './pages/HotkeyFolder/Hotkeys'
import { Routes, Route } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import ObsPage from "./components/obs-page";
import Graphs from './pages/GraphsFolder/Graphs';

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
  

  return (
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
         <Navbar/>
    
        <Routes>
          <Route path="/" element={<HomePage/>}/>
          <Route path="/notepad" element={<NotepadPage/>}/>
          <Route path="/hotkeys" element={<Hotkey/>}/>
          <Route path="/obspage" element={<ObsPage/>}/>
          <Route path="/graphs" element={<Graphs/>}/>
        </Routes>
      <div id="main-page">
        {/* {pages[page].elem} */}
        {/* {pages[page] ? pages[page].elem : <div>Page not found</div>} */}
      </div>
    </div>
  );
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
