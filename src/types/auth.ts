import { Organization } from "./organization";
import { User } from "@/types/user"

export interface MeResponse {
  user: { id: string; name: string; email: string; avatarUrl?: string };
  organizations: Organization[];
}

export interface AuthState {
  user: User | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
}
