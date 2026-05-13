export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  onboardingCompletedAt: string | null;
  currentPlan: { slug: string; name: string };
}

export type User = AuthenticatedUser;
