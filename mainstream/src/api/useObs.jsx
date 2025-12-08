// src/api/useObs.jsx
import { useEffect, useState, useRef } from "react";
import OBSWebSocket from "obs-websocket-js";

export function useObs({ address = "ws://127.0.0.1:4455", password }) {
  const [status, setStatus] = useState("disconnected"); // 'disconnected' | 'connecting' | 'connected' | 'error'
  const [error, setError] = useState(null);
  const obsRef = useRef(null);

  useEffect(() => {
    const obs = new OBSWebSocket();
    obsRef.current = obs;

    async function connect() {
      try {
        // If there is no password yet, don't attempt to connect
        if (!password) {
          setStatus("disconnected");
          setError(null);
          return;
        }

        setStatus("connecting");
        setError(null);
        await obs.connect(address, password || undefined);
        setStatus("connected");
      } catch (err) {
        console.error("OBS connection error:", err);
        setError(err);
        setStatus("error");
      }
    }

    // Automatically connect whenever address/password change
    connect();

    // Update status when OBS closes the connection
    obs.on("ConnectionClosed", () => {
      setStatus("disconnected");
    });

    return () => {
      if (obsRef.current) {
        obsRef.current.disconnect().catch(() => {});
        obsRef.current = null;
      }
    };
  }, [address, password]);

  function ensureConnected() {
    if (!obsRef.current) {
      throw new Error("Not connected to OBS");
    }
  }

  async function getScenes() {
    ensureConnected();
    return obsRef.current.call("GetSceneList");
  }

  // 🔹 New: used by ObsPage to fetch the sources for a scene
  async function getSceneItems(sceneName) {
    ensureConnected();
    const data = await obsRef.current.call("GetSceneItemList", { sceneName });
    return data.sceneItems || [];
  }

  async function switchScene(sceneName) {
    ensureConnected();
    return obsRef.current.call("SetCurrentProgramScene", { sceneName });
  }

  async function createScene(sceneName) {
    ensureConnected();
    return obsRef.current.call("CreateScene", { sceneName });
  }

  async function createColorSource(sceneName, sourceName, colorValue) {
    ensureConnected();

    return obsRef.current.call("CreateInput", {
      sceneName,
      inputName: sourceName,
      inputKind: "color_source_v3",
      inputSettings: {
        color: colorValue ?? 0xffffffff,
        width: 1920,
        height: 1080,
      },
      sceneItemEnabled: true,
    });
  }

  async function createBrowserOverlay(sceneName, sourceName, templateId) {
    ensureConnected();

    const url = `http://localhost:5173/overlay?template=${encodeURIComponent(
      templateId
    )}`;

    return obsRef.current.call("CreateInput", {
      sceneName,
      inputName: sourceName,
      inputKind: "browser_source",
      inputSettings: {
        url,
        width: 1920,
        height: 1080,
        shutdown: false,
        refresh_browser_when_scene_activated: true,
      },
      sceneItemEnabled: false,
    });
  }

  // Optional: still useful if you want to toggle overlay visibility elsewhere
  async function setSceneItemVisibility(sceneName, sourceName, enabled) {
    ensureConnected();

    const { sceneItemId } = await obsRef.current.call("GetSceneItemId", {
      sceneName,
      sourceName,
    });

    return obsRef.current.call("SetSceneItemEnabled", {
      sceneName,
      sceneItemId,
      sceneItemEnabled: enabled,
    });
  }

  return {
    status,
    error,
    getScenes,
    getSceneItems,          
    switchScene,
    createScene,
    createColorSource,
    createBrowserOverlay,
    setSceneItemVisibility, 
  };
}

export default useObs;
