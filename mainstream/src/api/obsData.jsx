// src/api/obsData.jsx
import { createContext, useContext, useState } from "react";
import { useObs } from "./useObs";

const ObsContext = createContext(null);

export function ObsProvider({ children }) {
  const [password, setPassword] = useState(
    () => window.localStorage.getItem("obsPassword") || ""
  );
  const obs = useObs(password);

  const updatePassword = (pw) => {
    setPassword(pw);
    window.localStorage.setItem("obsPassword", pw);
  };

  return (
    <ObsContext.Provider
      value={{ ...obs, password, setPassword: updatePassword }}
    >
      {children}
    </ObsContext.Provider>
  );
}

export function useObsConnection() {
  const ctx = useContext(ObsContext);
  if (!ctx) {
    throw new Error("useObsConnection must be used within ObsProvider");
  }
  return ctx;
}
export default useObsConnection;