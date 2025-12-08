// src/api/useObs.jsx
import { useEffect, useState, useRef } from "react";
import OBSWebSocket from "obs-websocket-js";

export function useObs({ address = "ws://127.0.0.1:4455", password }) {
  const [status, setStatus] = useState("disconnected");
  const [error, setError] = useState(null);
  const obsRef = useRef(null);

  useEffect(() => {
    const obs = new OBSWebSocket();
    obsRef.current = obs;

    async function connect() {
      try {
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

    if (password) connect();

    return () => {
      if (obsRef.current) {
        obsRef.current.disconnect().catch(() => {});
      }
    };
  }, [address, password]);

  async function getScenes() {
    if (!obsRef.current) throw new Error("Not connected to OBS");
    return obsRef.current.call("GetSceneList");
  }

  async function switchScene(sceneName) {
    if (!obsRef.current) throw new Error("Not connected to OBS");
    return obsRef.current.call("SetCurrentProgramScene", { sceneName });
  }

  async function createScene(sceneName) {
    if (!obsRef.current) throw new Error("Not connected to OBS");
    return obsRef.current.call("CreateScene", { sceneName });
  }

  async function createColorSource(sceneName, sourceName, colorValue) {
    if (!obsRef.current) throw new Error("Not connected to OBS");

    return obsRef.current.call("CreateInput", {
      sceneName,
      inputName: sourceName,
      inputKind: "color_source_v3",
      inputSettings: {
        color: colorValue,
        width: 1920,
        height: 1080,
      },
      sceneItemEnabled: true,
    });
  }

  async function createBrowserOverlay(sceneName, sourceName, templateId) {
    if (!obsRef.current) throw new Error("Not connected to OBS");

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
      sceneItemEnabled: true,
    });
  }

  // toggle visibility of an existing overlay source
  async function setSceneItemVisibility(sceneName, sourceName, enabled) {
    if (!obsRef.current) throw new Error("Not connected to OBS");

    // 1) Look up the scene item id by source name
    const { sceneItemId } = await obsRef.current.call("GetSceneItemId", {
      sceneName,
      sourceName,
    });

    // 2) Enable / disable that scene item
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
    switchScene,
    createScene,
    createColorSource,
    createBrowserOverlay,
    setSceneItemVisibility, // 👈 export the new helper
  };
}

export default useObs;
