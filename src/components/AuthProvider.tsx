"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { type AuthState, fetchCurrentUser } from "@/lib/auth";

interface AuthContextValue extends AuthState {
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    organizations: [],
    isAuthenticated: false,
    isLoading: true,
    isSuperAdmin: false,
  });

  useEffect(() => {
    fetchCurrentUser().then((next) => {
      setState({ ...next, isLoading: false });
    });
  }, []);

  const logout = useCallback(() => {
    setState({
      user: null,
      organizations: [],
      isAuthenticated: false,
      isLoading: false,
      isSuperAdmin: false,
    });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
