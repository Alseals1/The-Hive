import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
    staleTime: Infinity,
    retry: false,
  });
}

export function useUser() {
  const { data: session, ...rest } = useAuth();
  return { user: session?.user ?? null, ...rest };
}
