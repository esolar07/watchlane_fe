import { getMe } from "@/services/api";
import { type AuthState } from "@/types/auth";
export type { AuthState };

export async function fetchCurrentUser(): Promise<AuthState> {
  try {
    const { user, organizations } = await getMe();
    return { user, organizations, isAuthenticated: true, isLoading: false };
  } catch {
    return { user: null, organizations: [], isAuthenticated: false, isLoading: false };
  }
}
