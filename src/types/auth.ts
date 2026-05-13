import { AuthenticatedUser } from "./user";

export type MeResponse = AuthenticatedUser;

export interface AuthState {
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
