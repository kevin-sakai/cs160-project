// src/api/obsData.jsx
import { createContext, useContext, useState } from "react";
import { useObs } from "./useObs";

const ObsContext = createContext(null);

export function ObsProvider({ children }) {
  const [address, setAddress] = useState(
    () => window.localStorage.getItem("obsAddress") || "ws://127.0.0.1:4455"
  );
  const [password, setPassword] = useState(
    () => window.localStorage.getItem("obsPassword") || ""
  );

  // Pass BOTH address and password to the hook now
  const obs = useObs({ address, password });

  const updatePassword = (pw) => {
    setPassword(pw);
    window.localStorage.setItem("obsPassword", pw);
  };

  const updateAddress = (addr) => {
    setAddress(addr);
    window.localStorage.setItem("obsAddress", addr);
  };

  return (
    <ObsContext.Provider
      value={{
        ...obs,
        address,
        setAddress: updateAddress,
        password,
        setPassword: updatePassword,
      }}
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
