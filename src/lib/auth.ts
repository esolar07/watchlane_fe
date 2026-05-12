import { getMe } from "@/services/api";
import { type AuthState } from "@/types/auth";
export type { AuthState };

const SIGNED_OUT: AuthState = {
  user: null,
  organizations: [],
  isAuthenticated: false,
  isLoading: false,
  isSuperAdmin: false,
};

export async function fetchCurrentUser(): Promise<AuthState> {
  try {
    const me = await getMe();
    return {
      user: me.user,
      organizations: me.organizations,
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: Boolean(me.user.isSuperAdmin),
    };
  } catch {
    return SIGNED_OUT;
  }
}
