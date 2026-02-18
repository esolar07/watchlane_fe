import { getMe, type Organization } from "@/services/api";

export type { Organization };

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export async function fetchCurrentUser(): Promise<{
  user: User | null;
  organizations: Organization[];
  isAuthenticated: boolean;
}> {
  try {
    const { user, organizations } = await getMe();
    return { user, organizations, isAuthenticated: true };
  } catch {
    return { user: null, organizations: [], isAuthenticated: false };
  }
}
