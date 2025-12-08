// src/components/obs-page.jsx
import { useEffect, useRef, useState } from "react";
import OBSWebSocket from "obs-websocket-js";
import "./obs-page.css";
import { useObsConnection } from "../api/obsData";
import help from "../assets/help.png";
function ObsPage() {
  const [address, setAddress] = useState(
    () => window.localStorage.getItem("obsAddress") || "ws://127.0.0.1:4455"
  );
  const [password, setPassword] = useState(
    () => window.localStorage.getItem("obsPassword") || ""
  );
  const [status, setStatus] = useState("disconnected");

  const [health, setHealth] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState("");
  const [newSceneName, setNewSceneName] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const obsRef = useRef(null);

  // 👉 Get both setters from the shared context
  const { setPassword: setSharedObsPassword, setAddress: setSharedObsAddress } =
    useObsConnection();

  // Create / cleanup OBS client (local instance used by this page)
  useEffect(() => {
    const obs = new OBSWebSocket();
    obsRef.current = obs;

    obs.on("ConnectionClosed", () => {
      setStatus("disconnected");
    });

    return () => {
      if (obsRef.current) {
        obsRef.current.disconnect().catch(() => {});
        obsRef.current = null;
      }
    };
  }, []);

  // Connect to OBS running on the user's machine
  async function handleConnect(e) {
    e.preventDefault();
    if (!obsRef.current) return;

    try {
      setLoading(true);
      setErrorMsg("");
      setStatus("connecting");

      // Local connection (for this page’s UI)
      await obsRef.current.connect(address, password || undefined);
      setStatus("connected");

      // ✅ Update shared provider so TriggerEvents uses the same address + password
      setSharedObsPassword(password || "");
      setSharedObsAddress(address || "ws://127.0.0.1:4455");

      // Also persist locally so the connect form remembers it
      window.localStorage.setItem("obsAddress", address);
      window.localStorage.setItem("obsPassword", password || "");

      const versionInfo = await obsRef.current.call("GetVersion");
      setHealth(versionInfo);

      await loadScenes();
    } catch (err) {
      console.error("OBS connect error:", err);
      setStatus("error");
      setErrorMsg(
        err.message ||
          "Failed to connect to OBS. Is OBS open and WebSocket enabled?"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadScenes() {
    if (!obsRef.current) return;

    try {
      const data = await obsRef.current.call("GetSceneList");
      setScenes(data.scenes || []);
      setCurrentScene(data.currentProgramSceneName || "");

      if (data.currentProgramSceneName) {
        await loadSources(data.currentProgramSceneName);
      } else {
        setSources([]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load scenes from OBS.");
    }
  }

  async function loadSources(sceneName) {
    if (!obsRef.current) return;

    try {
      const data = await obsRef.current.call("GetSceneItemList", { sceneName });
      setSources(data.sceneItems || []);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load scene sources.");
    }
  }

  async function handleCreateScene(e) {
    e.preventDefault();
    if (!newSceneName.trim() || !obsRef.current) return;

    try {
      setErrorMsg("");
      await obsRef.current.call("CreateScene", {
        sceneName: newSceneName.trim(),
      });
      setNewSceneName("");
      await loadScenes();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create scene.");
    }
  }

  async function handleSelectScene(sceneName) {
    setCurrentScene(sceneName);
    await loadSources(sceneName);
  }

  async function handleAddSource() {
    if (!currentScene || !obsRef.current) return;

    const name = window.prompt("New source name?");
    if (!name) return;

    try {
      setErrorMsg("");
      // This matches your backend's CreateInput call
      await obsRef.current.call("CreateInput", {
        sceneName: currentScene,
        inputName: name,
        inputKind: "color_source_v3", // simple color source
        inputSettings: {}, // use OBS defaults
        sceneItemEnabled: true,
      });

      await loadSources(currentScene);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to create source.");
    }
  }

  async function handleSwitchScene(sceneName) {
    if (!sceneName || !obsRef.current) return;

    try {
      setErrorMsg("");
      await obsRef.current.call("SetCurrentProgramScene", {
        sceneName,
      });
      setCurrentScene(sceneName);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to switch scene.");
    }
  }
  const [addhelp, setAddHelp] = useState(false);
  return (
    <div className="obs-container">
      <div style={{ padding: "1rem" }}>
        <h1>OBS Control</h1>

        {/* Connection section */}
        <section className="obs-connection">
          <div className="header">
            <h2>Connect to OBS</h2>
            <img
              className="t-helpicon"
              src={help}
              alt="Help"
              onClick={() => setAddHelp(!addhelp)}
            />
          </div>
          {addhelp && (
            <p className="trigger-description">
              In OBS look for tools &gt; WebSocketServer Settings &gt; Show Connect Info. Input Server IP into address and Server Password into password.
            </p>
          )}
          <form onSubmit={handleConnect} className="obs-connect-form">
            <label>
              Address
              <input
                id="obsaddress"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="ws://127.0.0.1:4455"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="OBS WebSocket password"
              />
            </label>
            <button type="submit" disabled={loading}>
              {status === "connected" ? "Reconnect" : "Connect"}
            </button>
            <span className={`obs-status obs-status-${status}`}>
              Status: {status}
            </span>
          </form>
        </section>

        {loading && <p>Loading OBS status...</p>}
        {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

        {/* Health section */}
        <section>
          <h2>OBS Version / Health</h2>
          <pre style={{ background: "#ffffffff", padding: "0.5rem" }}>
            {health ? JSON.stringify(health, null, 2) : "Not connected yet."}
          </pre>
        </section>

        {/* Only show scenes/sources once connected */}
        {status === "connected" && (
          <>
            <section>
              <h2>Scenes</h2>
              <form
                onSubmit={handleCreateScene}
                style={{ marginBottom: "1rem" }}
              >
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
                    <button
                      type="button"
                      style={{ marginLeft: "0.5rem" }}
                      onClick={() => handleSwitchScene(scene.sceneName)}
                    >
                      Switch in OBS
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
          </>
        )}
      </div>
    </div>
  );
}

export default ObsPage;
