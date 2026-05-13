import { getMe } from "@/services/api";
import { type AuthState } from "@/types/auth";
export type { AuthState };

const SIGNED_OUT: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

export async function fetchCurrentUser(): Promise<AuthState> {
  try {
    const me = await getMe();
    return { user: me, isAuthenticated: true, isLoading: false };
  } catch {
    return SIGNED_OUT;
  }
}
