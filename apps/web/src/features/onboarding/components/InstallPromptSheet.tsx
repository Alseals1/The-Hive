import { useEffect, useRef, type FC } from "react";
import { toast } from "sonner";
import type { UsePwaResult } from "@/hooks/usePwa";

// ── Platform detection ──────────────────────────────────────────────────────

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua);
  // Not Chrome on iOS, not Firefox on iOS
  const isSafariEngine = !/crios|fxios|edgios|opios/i.test(ua);
  return isIos && isSafariEngine;
}

// ── iOS step illustrations ──────────────────────────────────────────────────

const ShareIcon: FC = () => (
  <svg
    viewBox="0 0 32 32"
    className="w-8 h-8 mx-auto"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="7" fill="#22222E" />
    <path
      d="M16 6v14M11 10l5-5 5 5"
      stroke="#FF5C1A"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M9 18v5a1 1 0 001 1h12a1 1 0 001-1v-5"
      stroke="#8E8EA4"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const AddToHomeIcon: FC = () => (
  <svg
    viewBox="0 0 32 32"
    className="w-8 h-8 mx-auto"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="7" fill="#22222E" />
    {/* Menu list lines */}
    <rect x="7" y="10" width="18" height="2.5" rx="1.2" fill="#636378" />
    <rect x="7" y="15" width="18" height="2.5" rx="1.2" fill="#FF5C1A" />
    <rect x="7" y="20" width="18" height="2.5" rx="1.2" fill="#636378" />
    {/* Plus badge */}
    <circle cx="24" cy="10" r="6" fill="#2ECC71" />
    <path d="M24 7v6M21 10h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const HomeScreenIcon: FC = () => (
  <svg
    viewBox="0 0 32 32"
    className="w-8 h-8 mx-auto"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="32" height="32" rx="7" fill="#FF5C1A" />
    <circle cx="16" cy="14" r="6" fill="white" opacity="0.25" />
    <text
      x="16"
      y="18"
      fontFamily="Arial Black, sans-serif"
      fontSize="9"
      fontWeight="900"
      textAnchor="middle"
      fill="white"
    >
      D
    </text>
    <rect x="10" y="23" width="12" height="2" rx="1" fill="white" opacity="0.5" />
  </svg>
);

// ── Android phone illustration ──────────────────────────────────────────────

const PhoneHomeScreen: FC = () => (
  <svg
    viewBox="0 0 80 130"
    className="w-16 h-auto mx-auto"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="76" height="126" rx="12" fill="#22222E" stroke="#44445A" strokeWidth="1.5" />
    <rect x="8" y="16" width="64" height="98" rx="6" fill="#13131A" />
    {/* App icon landing spot */}
    <rect x="18" y="26" width="20" height="20" rx="6" fill="#FF5C1A" />
    <text x="28" y="40" fontFamily="Arial Black, sans-serif" fontSize="10" fontWeight="900" textAnchor="middle" fill="white">D</text>
    {/* Other app placeholders */}
    <rect x="42" y="26" width="20" height="20" rx="6" fill="#2E2E3D" />
    <rect x="18" y="50" width="20" height="20" rx="6" fill="#2E2E3D" />
    <rect x="42" y="50" width="20" height="20" rx="6" fill="#2E2E3D" />
    {/* Home indicator */}
    <rect x="28" y="118" width="24" height="3" rx="1.5" fill="#44445A" />
  </svg>
);

// ── Main component ──────────────────────────────────────────────────────────

interface InstallPromptSheetProps {
  pwa: UsePwaResult;
}

export const InstallPromptSheet: FC<InstallPromptSheetProps> = ({ pwa }) => {
  const ios = isIosSafari();
  const sheetRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss if standalone is detected (user installed mid-session on iOS)
  useEffect(() => {
    if (pwa.isInstalled) pwa.markInstalled();
  }, [pwa.isInstalled]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInstall = async () => {
    const accepted = await pwa.promptInstall();
    if (accepted) {
      toast.success("You're in the dugout! ⚾", {
        description: "Dugout is now on your home screen.",
        duration: 4000,
      });
    } else {
      pwa.snoozeInstall();
    }
  };

  return (
    <>
      {/* Backdrop — tap to snooze */}
      <div
        className="fixed inset-0 z-30 bg-transparent"
        aria-hidden="true"
        onClick={pwa.snoozeInstall}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Add Dugout to your home screen"
        className="fixed bottom-0 left-0 right-0 z-40 bg-pitch-800 border-t border-pitch-700 rounded-t-2xl px-5 pt-5 pb-safe-or-6 safe-area-pb shadow-2xl animate-[slideUp_0.3s_ease-out]"
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-pitch-600 rounded-full mx-auto mb-5" aria-hidden="true" />

        {/* Badge */}
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-ember bg-ember-muted px-2.5 py-1 rounded-full mb-4">
          Quick tip
        </span>

        {ios ? <IosContent pwa={pwa} /> : <AndroidContent onInstall={handleInstall} />}

        {/* Not now */}
        <button
          onClick={pwa.snoozeInstall}
          className="mt-4 w-full min-h-[44px] text-pitch-300 text-sm"
          aria-label="Dismiss install prompt for now"
        >
          Not now
        </button>
      </div>
    </>
  );
};

// ── iOS variant ─────────────────────────────────────────────────────────────

const IosContent: FC<{ pwa: UsePwaResult }> = ({ pwa }) => {
  const steps = [
    { icon: <ShareIcon />, label: "Tap Share" },
    { icon: <AddToHomeIcon />, label: '"Add to Home Screen"' },
    { icon: <HomeScreenIcon />, label: "Tap Add" },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-display font-black text-2xl text-pitch-50 leading-tight">
          Play ball, right from your home screen.
        </h2>
        <p className="text-pitch-200 text-sm leading-relaxed">
          Add Dugout for faster access — no app store needed.
        </p>
      </div>

      {/* 3-step guide */}
      <div className="flex gap-3 justify-center" role="list" aria-label="Installation steps">
        {steps.map((s, i) => (
          <div key={i} role="listitem" className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-pitch-700">
              {s.icon}
            </div>
            <span className="text-pitch-200 text-xs text-center leading-tight">{s.label}</span>
            {i < steps.length - 1 && (
              <span className="absolute mt-5 ml-10 text-pitch-500 text-lg" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={pwa.snoozeInstall}
        className="w-full min-h-[52px] bg-pitch-700 text-pitch-50 font-display font-black text-lg rounded-xl active:opacity-80 transition-opacity"
        aria-label="I'll add it from Safari's Share menu"
      >
        Got it, I'll add it
      </button>
    </div>
  );
};

// ── Android variant ──────────────────────────────────────────────────────────

const AndroidContent: FC<{ onInstall: () => void }> = ({ onInstall }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-4">
      <PhoneHomeScreen />
      <div className="space-y-1 flex-1">
        <h2 className="font-display font-black text-2xl text-pitch-50 leading-tight">
          One tap. Right on your home screen.
        </h2>
        <p className="text-pitch-200 text-sm leading-relaxed">
          Add Dugout for instant access — loads fast, works like an app.
        </p>
      </div>
    </div>

    <button
      onClick={onInstall}
      className="w-full min-h-[52px] bg-ember text-white font-display font-black text-lg rounded-xl active:opacity-80 transition-opacity"
      aria-label="Add Dugout to your home screen"
    >
      Add to Home Screen
    </button>
  </div>
);
