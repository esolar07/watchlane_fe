import { Organization } from "./organization";
import { User } from "@/types/user";

export interface MeUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isSuperAdmin: boolean;
}

export interface MeResponse {
  user: MeUser;
  organizations: Organization[];
}

export interface AuthState {
  user: User | null;
  organizations: Organization[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
}
