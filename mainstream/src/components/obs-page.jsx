// src/components/obs-page.jsx
import { useEffect, useRef, useState } from "react";
import OBSWebSocket from "obs-websocket-js";
import "./obs-page.css";
import { useObsConnection } from "../api/obsData";
import help from "../assets/help.png";

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
  // Initialize IP + Port from stored obsAddress (for backward compatibility)
  const [ip, setIp] = useState(() => {
    const saved = window.localStorage.getItem("obsAddress") || "ws://127.0.0.1:4455";
    return parseAddressToIpPort(saved).ip;
  });
  const [port, setPort] = useState(() => {
    const saved = window.localStorage.getItem("obsAddress") || "ws://127.0.0.1:4455";
    return parseAddressToIpPort(saved).port;
  });

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

  // helper preview of full ws address
  const previewAddress = buildWebSocketAddress(ip, port);

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

    const fullAddress = buildWebSocketAddress(ip, port);

    try {
      setLoading(true);
      setErrorMsg("");
      setHealth("Connecting to OBS...");
      setStatus("connecting");

      // Local connection (for this page’s UI)
      await obsRef.current.connect(fullAddress, password || undefined);
      setStatus("connected");
      setHealth("Successfully connected to OBS!");

      // ✅ Update shared provider so TriggerEvents uses the same address + password
      setSharedObsPassword(password || "");
      setSharedObsAddress(fullAddress);

      // Persist the full ws:// URL + password
      window.localStorage.setItem("obsAddress", fullAddress);
      window.localStorage.setItem("obsPassword", password || "");

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

  const [addhelp, setAddHelp] = useState(false);

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
              In OBS look for Tools &gt; WebSocket Server Settings &gt; Show Connect Info.
              Input the <strong>Server IP</strong> into <strong>IP Address</strong>, the{" "}
              <strong>Server Port</strong> into <strong>Port</strong>, and the{" "}
              <strong>Server Password</strong> into <strong>Password</strong>.
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
