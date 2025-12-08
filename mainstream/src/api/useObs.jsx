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

  // Fetch the sources (scene items) for a scene
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

  // Generic CreateInput so we can create *any* source type
  async function createInput(sceneName, inputName, inputKind, inputSettings = {}, enabled = true) {
    ensureConnected();

    return obsRef.current.call("CreateInput", {
      sceneName,
      inputName,
      inputKind,
      inputSettings,
      sceneItemEnabled: enabled,
    });
  }

  // Kept for convenience where you specifically want a color source
  async function createColorSource(sceneName, sourceName, colorValue) {
    return createInput(sceneName, sourceName, "color_source_v3", {
      color: colorValue ?? 0xffffffff,
      width: 1920,
      height: 1080,
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

  // Toggle visibility of a scene item by name
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

  // Remove an entire scene
  async function removeScene(sceneName) {
    ensureConnected();
    return obsRef.current.call("RemoveScene", { sceneName });
  }

  // Remove a specific scene item (source instance) from a scene
  async function removeSceneItem(sceneName, sceneItemId) {
    ensureConnected();
    return obsRef.current.call("RemoveSceneItem", {
      sceneName,
      sceneItemId,
    });
  }

  return {
    status,
    error,
    getScenes,
    getSceneItems,
    switchScene,
    createScene,
    createInput,
    createColorSource,
    createBrowserOverlay,
    setSceneItemVisibility,
    removeScene,
    removeSceneItem,
  };
}

export default useObs;
