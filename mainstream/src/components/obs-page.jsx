// src/components/obs-page.jsx
import { useEffect, useState, Fragment } from "react";
import "./obs-page.css";
import { useObsConnection } from "../api/obsData";
import help from "../assets/help.png";
import { Link } from "react-router-dom";

// Map OBS input kinds to friendly category names
function getSourceCategoryLabel(kind) {
  if (!kind) return "Other Sources";

  switch (kind) {
    case "browser_source":
      return "Browser Sources";
    case "color_source_v3":
      return "Color Sources";
    case "game_capture":
      return "Game Capture";
    case "image_source":
      return "Image Sources";
    case "text_gdiplus":
      return "Text Sources";
    default:
      return kind
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/**
 * Parse a stored ws:// URL into { ip, port }.
 * Handles:
 *   ws://127.0.0.1:4455
 *   ws://[fd33:d0cd:...:bee2]:4455
 *   wss://... as well
 */
function parseAddressToIpPort(addressString) {
  const fallback = { ip: "127.0.0.1", port: "4455" };
  if (!addressString) return fallback;

  try {
    let s = addressString.trim();
    // Remove ws:// or wss:// prefix
    s = s.replace(/^wss?:\/\//i, "");
    if (!s) return fallback;

    let host = "";
    let port = "";

    if (s.startsWith("[")) {
      // IPv6 with brackets: [ip]:port
      const closing = s.indexOf("]");
      if (closing === -1) return fallback;

      host = s.slice(1, closing);
      const rest = s.slice(closing + 1); // e.g., ":4455"
      if (rest.startsWith(":")) {
        port = rest.slice(1);
      }
    } else {
      // IPv4 or hostname: host:port
      const lastColon = s.lastIndexOf(":");
      if (lastColon === -1) {
        host = s;
      } else {
        host = s.slice(0, lastColon);
        port = s.slice(lastColon + 1);
      }
    }

    return {
      ip: host || fallback.ip,
      port: port || fallback.port,
    };
  } catch {
    return fallback;
  }
}

/**
 * Build ws:// URL from ip + port.
 * If ip looks like IPv6 (contains ":" and is not already bracketed),
 * we wrap it in [ ]:  ws://[ipv6]:port
 */
function buildWebSocketAddress(ip, port) {
  const defaultIp = "127.0.0.1";
  const defaultPort = "4455";

  const rawIp = (ip || "").trim() || defaultIp;
  const rawPort = (port || "").trim() || defaultPort;

  const needsBrackets =
    rawIp.includes(":") && !rawIp.startsWith("[") && !rawIp.endsWith("]");

  const host = needsBrackets ? `[${rawIp}]` : rawIp;

  return `ws://${host}:${rawPort}`;
}

function ObsPage() {
  // Shared OBS connection (single source of truth for the app)
  const {
    status, // 'disconnected' | 'connecting' | 'connected' | 'error'
    error: obsError,
    getScenes,
    getSceneItems,
    createScene,
    createInput,
    switchScene,
    setSceneItemVisibility,
    removeScene,
    removeSceneItem,
    address: sharedAddress,
    password: sharedPassword,
    setAddress: setSharedAddress,
    setPassword: setSharedPassword,
  } = useObsConnection();

  // Initialize IP + Port from shared address / localStorage
  const [ip, setIp] = useState(() => {
    const saved =
      window.localStorage.getItem("obsAddress") ||
      sharedAddress ||
      "ws://127.0.0.1:4455";
    return parseAddressToIpPort(saved).ip;
  });

  const [port, setPort] = useState(() => {
    const saved =
      window.localStorage.getItem("obsAddress") ||
      sharedAddress ||
      "ws://127.0.0.1:4455";
    return parseAddressToIpPort(saved).port;
  });

  const [passwordInput, setPasswordInput] = useState(
    () => window.localStorage.getItem("obsPassword") || sharedPassword || ""
  );

  const [health, setHealth] = useState("Not connected yet.");
  const [scenes, setScenes] = useState([]);
  const [currentScene, setCurrentScene] = useState(""); // current program scene
  const [expandedSceneName, setExpandedSceneName] = useState(""); // scene whose sources are shown
  const [newSceneName, setNewSceneName] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [addhelp, setAddHelp] = useState(false);

  // Add-any-source controls
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceKind, setNewSourceKind] = useState("color_source_v3");
  const [newSourceUrl, setNewSourceUrl] = useState("");

  const previewAddress = buildWebSocketAddress(ip, port);

  // When OBS status changes, update health + load scenes if connected
  useEffect(() => {
    if (status === "connected") {
      setHealth("Successfully connected to OBS!");
      setErrorMsg("");
      loadScenes();
    } else if (status === "connecting") {
      setHealth("Connecting to OBS...");
    } else if (status === "disconnected") {
      setHealth("Disconnected from OBS.");
      // clear to avoid stale state
      setScenes([]);
      setSources([]);
      setExpandedSceneName("");
    } else if (status === "error") {
      const msg =
        (obsError && obsError.message) ||
        errorMsg ||
        "An OBS connection error occurred.";
      setErrorMsg(msg);
      setHealth(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, obsError]);

  async function loadScenes() {
    if (status !== "connected") return;

    try {
      const data = await getScenes();
      const obsScenes = data.scenes || [];
      setScenes(obsScenes);

      const programScene =
        data.currentProgramSceneName ||
        (obsScenes[0] && obsScenes[0].sceneName) ||
        "";
      setCurrentScene(programScene);

      // Do not expand anything by default; user clicks to expand
      setExpandedSceneName("");
      setSources([]);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to load scenes from OBS.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  async function loadSources(sceneName) {
    if (status !== "connected") return;

    try {
      const items = await getSceneItems(sceneName);
      setSources(items || []);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to load scene sources.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  // Connect: update shared address/password; the hook actually connects
  async function handleConnect(e) {
    e.preventDefault();
    const fullAddress = buildWebSocketAddress(ip, port);

    try {
      setLoading(true);
      setErrorMsg("");
      setHealth("Connecting to OBS...");

      setSharedAddress(fullAddress);
      setSharedPassword(passwordInput || "");

      window.localStorage.setItem("obsAddress", fullAddress);
      window.localStorage.setItem("obsPassword", passwordInput || "");
    } finally {
      setLoading(false);
    }
  }

  // Disconnect: clear password so the shared hook disconnects
  function handleDisconnect() {
    setSharedPassword("");
    window.localStorage.setItem("obsPassword", "");

    setHealth("Disconnected from OBS.");
    setErrorMsg("");
    setScenes([]);
    setCurrentScene("");
    setSources([]);
    setExpandedSceneName("");
  }

  async function handleCreateScene(e) {
    e.preventDefault();
    if (!newSceneName.trim() || status !== "connected") return;

    try {
      setErrorMsg("");
      await createScene(newSceneName.trim());
      setNewSceneName("");
      await loadScenes();
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to create scene.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  async function handleDeleteScene(sceneName) {
    if (!sceneName || status !== "connected") return;
    const confirmDelete = window.confirm(
      `Delete scene "${sceneName}" from OBS? This cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      setErrorMsg("");

      // 1) Delete in OBS
      await removeScene(sceneName);

      // 2) Optimistically update local state so the list re-renders
      setScenes((prevScenes) =>
        prevScenes.filter((scene) => scene.sceneName !== sceneName)
      );

      // 3) Clear selection if we just deleted the active/expanded scene
      if (currentScene === sceneName) {
        setCurrentScene("");
      }
      if (expandedSceneName === sceneName) {
        setExpandedSceneName("");
        setSources([]);
      }

      // 4) re-sync from OBS (in case anything else changed)
      //await loadScenes();
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to delete scene.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }


  async function handleToggleSceneExpand(sceneName) {
    if (expandedSceneName === sceneName) {
      // Collapse
      setExpandedSceneName("");
      setSources([]);
      return;
    }

    setExpandedSceneName(sceneName);
    await loadSources(sceneName);
  }

  async function handleSwitchScene(sceneName) {
    if (!sceneName || status !== "connected") return;

    try {
      setErrorMsg("");
      await switchScene(sceneName);
      setCurrentScene(sceneName);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to switch scene.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  async function handleAddSource(e) {
    e.preventDefault();
    if (!expandedSceneName || status !== "connected") return;
    const trimmedName = newSourceName.trim();
    if (!trimmedName) {
      setErrorMsg("Please enter a source name.");
      return;
    }

    try {
      setErrorMsg("");

      let inputSettings = {};

      if (newSourceKind === "browser_source") {
        inputSettings = {
          url: newSourceUrl.trim() || "https://example.com",
          width: 1920,
          height: 1080,
          shutdown: false,
        };
      }

      await createInput(
        expandedSceneName,
        trimmedName,
        newSourceKind,
        inputSettings
      );

      setNewSourceName("");
      setNewSourceUrl("");
      await loadSources(expandedSceneName);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to create source.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  async function handleDeleteSource(item) {
    if (!expandedSceneName || status !== "connected") return;
    const confirmDelete = window.confirm(
      `Remove "${item.sourceName}" from scene "${expandedSceneName}"?`
    );
    if (!confirmDelete) return;

    try {
      setErrorMsg("");
      await removeSceneItem(expandedSceneName, item.sceneItemId);
      await loadSources(expandedSceneName);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to delete source.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  async function handleToggleSourceVisibility(item) {
    if (!expandedSceneName || status !== "connected") return;

    try {
      setErrorMsg("");
      const nextEnabled = !item.sceneItemEnabled;
      await setSceneItemVisibility(
        expandedSceneName,
        item.sourceName,
        nextEnabled
      );
      await loadSources(expandedSceneName);
    } catch (err) {
      console.error(err);
      const msg = err.message || "Failed to toggle visibility.";
      setErrorMsg(msg);
      setHealth(msg);
    }
  }

  // Helper: text inside the status box
  function renderStatusText() {
    if (status === "connecting") return "Connecting to OBS...";
    if (status === "connected")
      return health || "Successfully connected to OBS!";
    if (status === "error")
      return errorMsg || health || "An OBS error occurred.";
    // default
    return health || "Not connected yet.";
  }

  // Group sources by inputKind for category rows in the table
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
              In OBS look for Tools &gt; WebSocket Server Settings &gt; Show
              Connect Info. Input the <strong>Server IP</strong> into{" "}
              <strong>Server IP</strong>, the <strong>Server Port</strong> into{" "}
              <strong>Port</strong>, and the <strong>Server Password</strong>{" "}
              into <strong>Password</strong>. For more help, see the <strong><Link to="/"  className="home-link">Home page</Link>.</strong>
            </p>
          )}
          <form onSubmit={handleConnect} className="obs-connect-form">
            <div className="credentials-inputs">
              <div className="serverIP">
                <label>
                  Server IP
                  <input
                    id="obs-ip"
                    type="text"
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    placeholder="127.0.0.1 or 2001:db8:85a3::8a2e:370:7334 format "
                  />
                </label>
              </div>
              <label>
                Port
                <input
                  id="obs-port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder="4455"
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="OBS WebSocket password"
                />
              </label>
            </div>
            <small style={{ display: "block", margin: "0.25rem 0 0.75rem" }}>
              Will connect to: <code>{previewAddress}</code>
            </small>
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
          <pre
            className="connectionStatus"
            style={{ background: "#ffffffff", padding: "1rem" }}
          >
            {renderStatusText()}
          </pre>
        </section>

        {/* Scenes list (top) + Sources (bottom) */}
        {status === "connected" && (
          <>
            {/* Scenes section */}
            <section className="obs-scenes-section">
              <div className="obs-panel obs-scenes-panel">
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
                    const isProgram = scene.sceneName === currentScene;
                    const isSelected = scene.sceneName === expandedSceneName;

                    return (
                      <li
                        key={scene.sceneName}
                        className={`obs-scene-item ${
                          isSelected ? "obs-scene-item--active" : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="obs-scene-main"
                          onClick={() =>
                            handleToggleSceneExpand(scene.sceneName)
                          }
                        >
                          <span className="obs-scene-name">
                            {scene.sceneName}
                          </span>
                          <span className="obs-scene-pill-row">
                            {isProgram && (
                              <span className="obs-scene-pill">
                                On Program
                              </span>
                            )}

                          </span>
                        </button>

                        <div className="obs-scene-row-actions">
                          <button
                            type="button"
                            className="obs-scene-switch"
                            onClick={() =>
                              handleSwitchScene(scene.sceneName)
                            }
                          >
                            Switch in OBS
                          </button>
                          <button
                            type="button"
                            className="obs-scene-delete"
                            onClick={() =>
                              handleDeleteScene(scene.sceneName)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>

            {/* Sources bottom section for expanded scene */}
            {expandedSceneName && (
              <section className="obs-sources-bottom-section">
                <div className="obs-panel obs-sources-panel">
                  <h2>Sources in: {expandedSceneName}</h2>

                  {/* Add-any-source form */}
                  <form
                    className="obs-add-source-form"
                    onSubmit={handleAddSource}
                  >
                    <div>
                      <label>
                        Source name
                        <input
                          type="text"
                          value={newSourceName}
                          onChange={(e) => setNewSourceName(e.target.value)}
                          placeholder="e.g., New Overlay"
                        />
                      </label>
                    </div>
                    <div className="sourceTypeContainer">
                      <label className="sourceTypeLabel">
                        <span>Source type</span>
                        <select
                          className="sourceTypeSelect"
                          value={newSourceKind}
                          onChange={(e) => setNewSourceKind(e.target.value)}
                        >
                          <option value="color_source_v3">Color Source</option>
                          <option value="browser_source">Browser Source</option>
                          <option value="image_source">Image Source</option>
                          <option value="game_capture">Game Capture</option>
                          <option value="text_gdiplus">Text (GDI+)</option>
                        </select>
                      </label>
                      <div className="obs-add-source-actions">
                        <button type="submit">Add Source</button>
                      </div>
                    </div>



                    {newSourceKind === "browser_source" && (
                      <div>
                        <label>
                          URL
                          <input
                            type="text"
                            value={newSourceUrl}
                            onChange={(e) =>
                              setNewSourceUrl(e.target.value)
                            }
                            placeholder="https://..."
                          />
                        </label>
                      </div>
                    )}


                  </form>

                  {sources.length === 0 ? (
                    <p style={{ marginTop: "0.5rem" }}>No sources in this scene yet.</p>
                  ) : (
                    <div className="obs-sources-groups">
                      {Object.entries(sourcesByKind).map(([kind, items]) => (
                        <div className="obs-sources-category-block" key={kind}>
                          <div className="obs-sources-group-title">
                            {getSourceCategoryLabel(kind)}
                          </div>

                          <div className="obs-sources-list">
                            {items.map((item, index) => (
                              <div
                                key={item.sceneItemId}
                                className={`obs-source-row ${
                                  index < items.length - 1 ? "obs-source-row--bordered" : ""
                                }`}
                              >
                                <div className="obs-source-name">{item.sourceName}</div>

                                {/* <div
                                  className={
                                    item.sceneItemEnabled
                                      ? "obs-source-visible"
                                      : "obs-source-hidden"
                                  }
                                >
                                  {item.sceneItemEnabled ? "Visible" : "Hidden"}
                                </div> */}

                                <div className="obs-source-actions">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleSourceVisibility(item)}
                                  >
                                    {item.sceneItemEnabled ? "Hide" : "Show"}
                                  </button>
                                  <button
                                    type="button"
                                    className="obs-source-delete"
                                    onClick={() => handleDeleteSource(item)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}


                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ObsPage;
