import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    const publicPaths = ["/auth/login", "/auth/signup"];
    const isPublic =
      publicPaths.some((p) => location.pathname.startsWith(p)) ||
      location.pathname.startsWith("/invite/");

    if (!isPublic) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw redirect({ to: "/auth/login" });
      }
    }
  },
  component: () => <Outlet />,
});
