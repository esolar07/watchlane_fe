import { useAuth } from "@/components/AuthProvider";

export function useMe() {
  const { user, isLoading, refetch } = useAuth();
  return { user, isLoading, refetch };
}
