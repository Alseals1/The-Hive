import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { NotFoundPage } from "@/components/shared/NotFoundPage";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { usePendingJoin } from "@/hooks/usePendingJoin";
import { usePwa } from "@/hooks/usePwa";
import { useInstallTrigger } from "@/features/onboarding/hooks/useInstallTrigger";
import { InstallPromptSheet } from "@/features/onboarding/components/InstallPromptSheet";

const IOS_WELCOME_KEY = "dugout:ios_welcome_shown";

function RootComponent() {
  usePendingJoin();
  const pwa = usePwa();
  const showInstallPrompt = useInstallTrigger(pwa);
  const toastShown = useRef(false);

  // iOS: fire a welcome toast the first time the app opens in standalone mode
  useEffect(() => {
    if (
      pwa.isInstalled &&
      !toastShown.current &&
      !localStorage.getItem(IOS_WELCOME_KEY)
    ) {
      toastShown.current = true;
      localStorage.setItem(IOS_WELCOME_KEY, "1");
      toast.success("Welcome to the dugout! ⚾", {
        description: "You're all set — Dugout is on your home screen.",
        duration: 4000,
      });
      pwa.markInstalled();
    }
  }, [pwa.isInstalled]); // eslint-disable-line react-hooks/exhaustive-deps

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
