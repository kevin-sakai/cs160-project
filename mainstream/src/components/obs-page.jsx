// src/components/obs-page.jsx
import { useEffect, useState } from "react";
import {
  getObsHealth,
  getScenes,
  createScene,
  getSceneSources,
  createSource,
  switchScene,
} from "../api/obs"; 
import "./obs-page.css";

function ObsPage() {
  const [health, setHealth] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState("");
  const [newSceneName, setNewSceneName] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setErrorMsg("");
        const h = await getObsHealth();
        setHealth(h);

        const sceneData = await getScenes();
        setScenes(sceneData.scenes || []);
        setCurrentScene(sceneData.currentProgramSceneName || "");
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Failed to load OBS data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleCreateScene(e) {
    e.preventDefault();
    if (!newSceneName.trim()) return;
    try {
      setErrorMsg("");
      await createScene(newSceneName.trim());
      const updated = await getScenes();
      setScenes(updated.scenes || []);
      setNewSceneName("");
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create scene.");
    }
  }

  async function handleSelectScene(sceneName) {
    setCurrentScene(sceneName);
    try {
      setErrorMsg("");
      const data = await getSceneSources(sceneName);
      setSources(data.sceneItems || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load scene sources.");
    }
  }

  async function handleAddSource() {
    if (!currentScene) return;
    const name = window.prompt("New source name?");
    if (!name) return;
    try {
      setErrorMsg("");
      await createSource(currentScene, name);
      const data = await getSceneSources(currentScene);
      setSources(data.sceneItems || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create source.");
    }
  }

  async function handleSwitchScene() {
    if (!currentScene) return;
    try {
      setErrorMsg("");
      await switchScene(currentScene);
      
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to switch scene.");
    }
  }

  return (
    <div className="obs-container">
        <div style={{ padding: "1rem" }}>
        <h1>OBS Control</h1>

        {loading && <p>Loading OBS status...</p>}
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        <section>
            <h2>Backend / OBS Status</h2>
            <pre style={{ background: "#ffffffff", padding: "0.5rem" }}>
            {health ? JSON.stringify(health, null, 2) : "No data yet."}
            </pre>
        </section>

        <section>
            <h2>Scenes</h2>
            <form onSubmit={handleCreateScene} style={{ marginBottom: "1rem" }}>
            <input
                value={newSceneName}
                onChange={(e) => setNewSceneName(e.target.value)}
                placeholder="New scene name"
            />
            <button type="submit">Create Scene</button>
            </form>

            <ul>
            {scenes.map((scene) => (
                <li key={scene.sceneName}>
                <button
                    type="button"
                    onClick={() => handleSelectScene(scene.sceneName)}
                >
                    {scene.sceneName}
                </button>
                </li>
            ))}
            </ul>


        </section>

        <section>
            <h2>Sources in Scene: {currentScene || "(none selected)"}</h2>
            <button
            type="button"
            onClick={handleAddSource}
            disabled={!currentScene}
            >
            Add color source
            </button>
            <ul>
            {sources.map((item) => (
                <li key={item.sceneItemId}>
                [{item.sceneItemId}] {item.sourceName}{" "}
                {item.inputKind ? `(${item.inputKind})` : ""}
                </li>
            ))}
            </ul>
        </section>
        </div>
    </div>
  );
}


export default ObsPage;
