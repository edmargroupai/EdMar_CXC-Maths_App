import { createContext, useContext, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

// Minimal in-memory session holder for the auth preview (see supabase.ts —
// the client itself doesn't persist sessions). The real auth state — backed
// by expo-secure-store, surviving app restarts — is P14 (§19).
interface AuthContextValue {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  return <AuthContext.Provider value={{ session, setSession }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
