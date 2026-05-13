"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { type AuthState, fetchCurrentUser } from "@/lib/auth";

interface AuthContextValue extends AuthState {
  logout: () => void;
  refetch: () => Promise<void>;
}

const INITIAL_STATE: AuthState = { user: null, isAuthenticated: false, isLoading: true };
const SIGNED_OUT_STATE: AuthState = { user: null, isAuthenticated: false, isLoading: false };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  const refetch = useCallback(async () => {
    const next = await fetchCurrentUser();
    setState(next);
  }, []);

  useEffect(() => {
    let active = true;
    fetchCurrentUser().then((next) => {
      if (active) setState(next);
    });
    return () => {
      active = false;
    };
  }, []);

  const logout = useCallback(() => {
    setState(SIGNED_OUT_STATE);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
