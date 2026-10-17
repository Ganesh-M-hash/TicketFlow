import { useState } from "react";
import { AuthContext } from "./useAuth";

const AUTH_STORAGE_KEY = "ticketflow.auth";

function readStoredSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY));
    return session?.token && session?.user ? session : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);

  function signIn(nextSession) {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    setSession(nextSession);
  }

  function signOut() {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  }

  const authValue = {
    user: session?.user ?? null,
    isAuthenticated: Boolean(session?.token),
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}