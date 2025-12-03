// src/api/useObs.js
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
        console.error("OBS connect error", err);
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

  async function getScenes() {
    if (!obsRef.current) return null;
    return obsRef.current.call("GetSceneList");
  }

  async function switchScene(name) {
    if (!obsRef.current) return;
    return obsRef.current.call("SetCurrentProgramScene", {
      sceneName: name,
    });
  }

  return { status, error, getScenes, switchScene };
}
export default useObs;