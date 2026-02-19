import { getMe } from "@/services/api";
import { AuthState } from "@/types/auth";

export async function fetchCurrentUser(): Promise<AuthState> {
  try {
    const { user, organizations } = await getMe();
    return { user, organizations, isAuthenticated: true, isLoading: false };
  } catch {
    return { user: null, organizations: [], isAuthenticated: false, isLoading: false };
  }
}
