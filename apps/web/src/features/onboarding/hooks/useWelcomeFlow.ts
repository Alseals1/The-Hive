import { useState, useCallback } from "react";

const STORAGE_KEY = "dugout:seen_welcome_v1";

function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markWelcomeSeen(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // ignore
  }
}

export function useWelcomeFlow() {
  const [visible, setVisible] = useState(() => !hasSeenWelcome());

  const dismiss = useCallback(() => {
    markWelcomeSeen();
    setVisible(false);
  }, []);

  return { visible, dismiss };
}
