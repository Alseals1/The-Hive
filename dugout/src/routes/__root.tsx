import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { NotFoundPage } from "@/components/shared/NotFoundPage";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { usePendingJoin } from "@/hooks/usePendingJoin";
import { usePwa } from "@/hooks/usePwa";
import { useInstallTrigger } from "@/features/onboarding/hooks/useInstallTrigger";
import { InstallPromptSheet } from "@/features/onboarding/components/InstallPromptSheet";

function RootComponent() {
  usePendingJoin();
  const pwa = usePwa();
  const showInstallPrompt = useInstallTrigger(pwa);

  return (
    <ErrorBoundary>
      <>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black"
        >
          Skip to content
        </a>
        <Outlet />
        {showInstallPrompt && <InstallPromptSheet pwa={pwa} />}
      </>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  notFoundComponent: () => <NotFoundPage />,
  beforeLoad: async ({ location }) => {
    const publicPaths = ["/auth/login", "/auth/signup", "/auth/forgot-password", "/auth/reset-password"];
    const isPublic =
      publicPaths.some((p) => location.pathname.startsWith(p)) ||
      location.pathname.startsWith("/invite/") ||
      location.pathname.startsWith("/join/");

    if (!isPublic) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw redirect({ to: "/auth/login" });
      }
    }
  },
  component: RootComponent,
});
