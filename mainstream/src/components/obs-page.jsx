// src/components/obs-page.jsx
import { useEffect, useRef, useState } from "react";
import OBSWebSocket from "obs-websocket-js";
import "./obs-page.css";
import { useObsConnection } from "../api/obsData";

// Map OBS input kinds to friendly category names
function getSourceCategoryLabel(kind) {
  if (!kind) return "Other Sources";

  switch (kind) {
    case "browser_source":
      return "Browser Sources";
    case "color_source_v3":
      return "Color Sources";
    // Add more mappings here 
     case "game_capture":
       return "Game Capture";
    default:
      // Fallback: prettify the raw kind string
      return kind
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function ObsPage() {
  const [address, setAddress] = useState(
    () => window.localStorage.getItem("obsAddress") || "ws://127.0.0.1:4455"
  );
  const [password, setPassword] = useState(
    () => window.localStorage.getItem("obsPassword") || ""
  );
  const [status, setStatus] = useState("disconnected"); // disconnected | connecting | connected | error

  const [health, setHealth] = useState(null); // connection status / error text
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState("");
  const [newSceneName, setNewSceneName] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const obsRef = useRef(null);

  // Shared OBS connection (used by TriggerEvents, etc.)
  const {
    setPassword: setSharedObsPassword,
    setAddress: setSharedObsAddress,
  } = useObsConnection();

  // Create / cleanup OBS client (local instance used by this page)
  useEffect(() => {
    const obs = new OBSWebSocket();
    obsRef.current = obs;

    obs.on("ConnectionClosed", () => {
      setStatus("disconnected");
      setHealth("Disconnected from OBS.");
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
      setHealth("Connecting to OBS...");
      setStatus("connecting");

      // Local connection (for this page’s UI)
      await obsRef.current.connect(address, password || undefined);
      setStatus("connected");
      setHealth("Successfully connected to OBS!");

      // ✅ Update shared provider so TriggerEvents uses the same address + password
      setSharedObsPassword(password || "");
      setSharedObsAddress(address || "ws://127.0.0.1:4455");

      // Also persist locally so the connect form remembers it
      window.localStorage.setItem("obsAddress", address);
      window.localStorage.setItem("obsPassword", password || "");

      // version details again, can restore:
      // const versionInfo = await obsRef.current.call("GetVersion");
      // setHealth(`Connected: OBS ${versionInfo.obsVersion}`);

      await loadScenes();
    } catch (err) {
      console.error("OBS connect error:", err);
      setStatus("error");
      const msg =
        err.message ||
        "Failed to connect to OBS. Is OBS open and WebSocket enabled?";
      setErrorMsg(msg);
      setHealth(msg); // show error in status box
    } finally {
      setLoading(false);
    }
  }

  // Explicit disconnect handler
  function handleDisconnect() {
    if (obsRef.current) {
      obsRef.current.disconnect().catch(() => {});
    }

    // Clear local connection state
    setStatus("disconnected");
    setHealth("Disconnected from OBS.");
    setErrorMsg("");
    setScenes([]);
    setCurrentScene("");
    setSources([]);

    // Also clear shared connection password so the shared hook disconnects
    setSharedObsPassword("");
    window.localStorage.setItem("obsPassword", "");
  }

  async function loadScenes() {
    if (!obsRef.current) return;

    try {
      const data = await obsRef.current.call("GetSceneList");
      const obsScenes = data.scenes || [];
      setScenes(obsScenes);
      const programScene =
        data.currentProgramSceneName ||
        (obsScenes[0] && obsScenes[0].sceneName) ||
        "";
      setCurrentScene(programScene);

      if (programScene) {
        await loadSources(programScene);
      } else {
        setSources([]);
      }
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to load scenes from OBS.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  async function loadSources(sceneName) {
    if (!obsRef.current) return;

    try {
      const data = await obsRef.current.call("GetSceneItemList", { sceneName });
      setSources(data.sceneItems || []);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to load scene sources.";
      setErrorMsg(msg);
      setHealth(msg);
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
      const msg = err.message || "Failed to create scene.";
      setErrorMsg(msg);
      setHealth(msg);
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
      // This matches new backend's CreateInput call
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
      const msg = err.message || "Failed to create source.";
      setErrorMsg(msg);
      setHealth(msg);
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
      const msg = err.message || "Failed to switch scene.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  // Helper: text inside the status box
  function renderStatusText() {
    if (status === "connecting") return "Connecting to OBS...";
    if (status === "connected") return health || "Successfully connected to OBS!";
    if (status === "error") return errorMsg || health || "An OBS error occurred.";
    // default
    return health || "Not connected yet.";
  }

  // Group sources by inputKind so we can show categories like "Browser Sources"
  const sourcesByKind = sources.reduce((acc, item) => {
    const kind = item.inputKind || "other";
    if (!acc[kind]) acc[kind] = [];
    acc[kind].push(item);
    return acc;
  }, {});

  return (
    <div className="obs-container">
      <div style={{ padding: "1rem" }}>
        <h1>OBS Control</h1>

        {/* Connection section */}
        <section className="obs-connection">
          <h2>Connect to OBS</h2>
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
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={status === "disconnected" || status === "connecting"}
              style={{ marginLeft: "0.5rem" }}
            >
              Disconnect
            </button>
            <span className={`obs-status obs-status-${status}`}>
              Status: {status}
            </span>
          </form>
        </section>

        {loading && <p>Loading OBS status...</p>}

        {/* Connection status box (health + any error messages) */}
        <section>
          <h2>OBS Connection Status</h2>
          <pre className="connectionStatus" style={{ background: "#ffffffff", padding: "1rem" }}>
            {renderStatusText()}
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

              <ul className="obs-scenes-list">
                {scenes.map((scene) => {
                  const isCurrent = scene.sceneName === currentScene;
                  return (
                    <li
                      key={scene.sceneName}
                      className={`obs-scene-item ${
                        isCurrent ? "obs-scene-item--active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="obs-scene-main"
                        onClick={() => handleSelectScene(scene.sceneName)}
                      >
                        <span className="obs-scene-name">
                          {scene.sceneName}
                        </span>
                        {isCurrent && (
                          <span className="obs-scene-pill">Selected</span>
                        )}
                      </button>

                      <button
                        type="button"
                        className="obs-scene-switch"
                        onClick={() => handleSwitchScene(scene.sceneName)}
                      >
                        Switch in OBS
                      </button>
                    </li>
                  );
                })}
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

              {(!currentScene || sources.length === 0) && (
                <p style={{ marginTop: "0.5rem" }}>
                  No sources in this scene yet.
                </p>
              )}

              {currentScene && sources.length > 0 && (
                <div className="obs-sources-groups">
                  {Object.entries(sourcesByKind).map(([kind, items]) => (
                    <div key={kind} className="obs-sources-group">
                      <div className="obs-sources-group-title">
                        {getSourceCategoryLabel(kind)}
                      </div>
                      <ul className="obs-sources-list">
                        {items.map((item) => (
                          <li
                            key={item.sceneItemId}
                            className="obs-source-item"
                          >
                            {item.sourceName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default ObsPage;
