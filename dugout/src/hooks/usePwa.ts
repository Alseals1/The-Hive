import { useCallback, useEffect, useRef, useState } from "react";

type InstallStatus = "pending" | "dismissed" | "installed" | "snoozed";

interface PwaInstallState {
  status: InstallStatus;
  dismissedAt: string | null;
  snoozeCount: number;
}

const STORAGE_KEY = "dugout:pwa_install";
const SNOOZE_DAYS = 7;
const MAX_SNOOZES = 2;

function readInstallState(): PwaInstallState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PwaInstallState;
  } catch {
    // ignore corrupt storage
  }
  return { status: "pending", dismissedAt: null, snoozeCount: 0 };
}

function writeInstallState(state: PwaInstallState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function isSnoozeExpired(state: PwaInstallState): boolean {
  if (state.status !== "snoozed" || !state.dismissedAt) return false;
  const snoozedAt = new Date(state.dismissedAt).getTime();
  const expiresAt = snoozedAt + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() >= expiresAt;
}

function isStandaloneMode(): boolean {
  // Standard display-mode check (Android + modern iOS)
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // Legacy iOS Safari check
  if ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
    return true;
  return false;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface UsePwaResult {
  /** True when the app is running as an installed PWA (standalone mode). */
  isInstalled: boolean;
  /** True when the Android native install prompt is available to trigger. */
  canInstall: boolean;
  /** Persisted install status from localStorage. */
  installStatus: InstallStatus;
  /** Trigger the native Android install prompt. Resolves to true if accepted. */
  promptInstall: () => Promise<boolean>;
  /** Snooze the prompt for SNOOZE_DAYS days. Permanently dismisses after MAX_SNOOZES snoozes. */
  snoozeInstall: () => void;
  /** Permanently dismiss the install prompt. */
  dismissInstall: () => void;
  /** Mark the app as installed (call after iOS manual install detected). */
  markInstalled: () => void;
}

export function usePwa(): UsePwaResult {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(isStandaloneMode);
  const [canInstall, setCanInstall] = useState(false);
  const [installStatus, setInstallStatus] = useState<InstallStatus>(() => {
    const state = readInstallState();
    // Treat expired snooze as pending again
    if (isSnoozeExpired(state)) return "pending";
    return state.status;
  });

  useEffect(() => {
    // If already standalone, mark installed and stop
    if (isStandaloneMode()) {
      setIsInstalled(true);
      const current = readInstallState();
      if (current.status !== "installed") {
        const next = { ...current, status: "installed" as InstallStatus };
        writeInstallState(next);
        setInstallStatus("installed");
      }
      return;
    }

    // Listen for Android native install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setCanInstall(true);
    };

    // Listen for successful install (Android)
    const handleAppInstalled = () => {
      deferredPrompt.current = null;
      setCanInstall(false);
      setIsInstalled(true);
      const next: PwaInstallState = {
        status: "installed",
        dismissedAt: null,
        snoozeCount: readInstallState().snoozeCount,
      };
      writeInstallState(next);
      setInstallStatus("installed");
    };

    // Listen for standalone mode change (e.g. user installs mid-session)
    const mq = window.matchMedia("(display-mode: standalone)");
    const handleMqChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    mq.addEventListener("change", handleMqChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mq.removeEventListener("change", handleMqChange);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt.current) return false;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    deferredPrompt.current = null;
    setCanInstall(false);
    if (outcome === "accepted") {
      const next: PwaInstallState = { status: "installed", dismissedAt: null, snoozeCount: 0 };
      writeInstallState(next);
      setInstallStatus("installed");
      return true;
    }
    return false;
  }, []);

  const snoozeInstall = useCallback(() => {
    const current = readInstallState();
    const newCount = current.snoozeCount + 1;
    // After MAX_SNOOZES snoozes, permanently dismiss
    const next: PwaInstallState =
      newCount >= MAX_SNOOZES
        ? { status: "dismissed", dismissedAt: new Date().toISOString(), snoozeCount: newCount }
        : { status: "snoozed", dismissedAt: new Date().toISOString(), snoozeCount: newCount };
    writeInstallState(next);
    setInstallStatus(next.status);
  }, []);

  const dismissInstall = useCallback(() => {
    const next: PwaInstallState = {
      status: "dismissed",
      dismissedAt: new Date().toISOString(),
      snoozeCount: readInstallState().snoozeCount,
    };
    writeInstallState(next);
    setInstallStatus("dismissed");
  }, []);

  const markInstalled = useCallback(() => {
    const next: PwaInstallState = { status: "installed", dismissedAt: null, snoozeCount: 0 };
    writeInstallState(next);
    setInstallStatus("installed");
    setIsInstalled(true);
  }, []);

  return {
    isInstalled,
    canInstall,
    installStatus,
    promptInstall,
    snoozeInstall,
    dismissInstall,
    markInstalled,
  };
}
