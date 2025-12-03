// src/api/useObs.jsx
import { useEffect, useState, useRef } from "react";
import OBSWebSocket from "obs-websocket-js";

export function useObs(password) {
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
        await obs.connect("ws://127.0.0.1:4455", password);
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
  }, [password]);

  // --- WebSocket OBS calls ---

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
        height: 1080
      },
      sceneItemEnabled: true,
    });
  }

  return {
    status,
    error,
    getScenes,
    switchScene,
    createScene,
    createColorSource,
  };
}

export default useObs;
