import { useState, useRef, useCallback, useEffect } from "react";
import type { FC, TouchEvent } from "react";
import { useScrollTrap } from "@/hooks/useScrollTrap";

interface WelcomeFlowProps {
  firstName: string;
  onDismiss: () => void;
}

const STEPS = 3;

// SVG illustrations — inline, zero external deps, reduced-motion safe
const DugoutIllustration: FC = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 200 140"
    className="w-48 h-auto mx-auto"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bench */}
    <rect x="20" y="100" width="160" height="10" rx="5" fill="#44445A" />
    <rect x="35" y="110" width="8" height="20" rx="3" fill="#2E2E3D" />
    <rect x="155" y="110" width="8" height="20" rx="3" fill="#2E2E3D" />
    {/* Roof */}
    <path d="M10 98 L100 30 L190 98 Z" fill="#22222E" />
    <path d="M10 98 L190 98" stroke="#FF5C1A" strokeWidth="3" />
    {/* Players (simplified silhouettes) */}
    <circle cx="70" cy="88" r="10" fill="#636378" />
    <rect x="62" y="98" width="16" height="18" rx="4" fill="#636378" />
    <circle cx="100" cy="85" r="10" fill="#8E8EA4" />
    <rect x="92" y="95" width="16" height="18" rx="4" fill="#8E8EA4" />
    <circle cx="130" cy="88" r="10" fill="#636378" />
    <rect x="122" y="98" width="16" height="18" rx="4" fill="#636378" />
    {/* Baseball */}
    <circle cx="160" cy="50" r="12" fill="white" />
    <path d="M152 46 Q155 50 152 54" stroke="#FF5C1A" strokeWidth="1.5" fill="none" />
    <path d="M168 46 Q165 50 168 54" stroke="#FF5C1A" strokeWidth="1.5" fill="none" />
  </svg>
);

const CalendarIllustration: FC = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 200 160"
    className="w-48 h-auto mx-auto"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Phone */}
    <rect x="60" y="10" width="80" height="140" rx="12" fill="#22222E" />
    <rect x="65" y="20" width="70" height="120" rx="8" fill="#13131A" />
    {/* Calendar card */}
    <rect x="70" y="30" width="60" height="55" rx="6" fill="#22222E" stroke="#FF5C1A" strokeWidth="1.5" />
    <rect x="70" y="30" width="60" height="16" rx="6" fill="#FF5C1A" />
    <text x="100" y="42" fontFamily="Arial, sans-serif" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">JUNE</text>
    {/* Grid dots */}
    {[0,1,2,3,4,5,6].map((i) => (
      <circle key={i} cx={76 + (i % 4) * 14} cy={60 + Math.floor(i / 4) * 12} r="3" fill="#44445A" />
    ))}
    <circle cx="76" cy="60" r="3" fill="#2ECC71" />
    <circle cx="90" cy="60" r="3" fill="#FF5C1A" />
    {/* Notification badge */}
    <circle cx="128" cy="32" r="8" fill="#FF5C1A" />
    <text x="128" y="36" fontFamily="Arial, sans-serif" fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">2</text>
    {/* Bottom content */}
    <rect x="70" y="95" width="60" height="7" rx="3" fill="#2E2E3D" />
    <rect x="70" y="108" width="40" height="7" rx="3" fill="#2E2E3D" />
    <rect x="70" y="121" width="50" height="7" rx="3" fill="#2E2E3D" />
  </svg>
);

const MegaphoneIllustration: FC = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 200 160"
    className="w-48 h-auto mx-auto"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Megaphone body */}
    <path d="M40 75 L120 40 L120 120 L40 95 Z" fill="#FF5C1A" />
    <rect x="20" y="75" width="22" height="20" rx="4" fill="#E04A0F" />
    {/* Horn end */}
    <path d="M120 40 L165 20 L165 140 L120 120 Z" fill="#E04A0F" />
    {/* Sound waves */}
    <path d="M170 60 Q185 80 170 100" stroke="#FF5C1A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
    <path d="M178 50 Q200 80 178 110" stroke="#FF5C1A" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
    {/* Speech bubble */}
    <rect x="30" y="30" width="70" height="30" rx="8" fill="#22222E" stroke="#2ECC71" strokeWidth="1.5" />
    <path d="M55 60 L60 70 L70 60" fill="#22222E" stroke="#2ECC71" strokeWidth="1.5" strokeLinejoin="round" />
    <text x="65" y="50" fontFamily="Arial, sans-serif" fontSize="9" fill="#2ECC71" textAnchor="middle" fontWeight="bold">Game Day!</text>
  </svg>
);

const steps = [
  {
    illustration: <DugoutIllustration />,
    headingTemplate: (name: string) => `You're in the dugout${name ? `, ${name}` : ""}.`,
    body: "Everything your team needs, right here.",
    cta: "Let's go →",
  },
  {
    illustration: <CalendarIllustration />,
    headingTemplate: () => "Never miss a game.",
    body: "Check the schedule, RSVP in seconds, and get reminders for every practice and game.",
    cta: "Got it →",
  },
  {
    illustration: <MegaphoneIllustration />,
    headingTemplate: () => "Stay in the loop.",
    body: "Coaches post. You're the first to know. Announcements, rosters, and payment reminders — all in one place.",
    cta: "Take me to the schedule →",
  },
];

export const WelcomeFlow: FC<WelcomeFlowProps> = ({ firstName, onDismiss }) => {
  const [step, setStep] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useScrollTrap(true);

  // Focus the container on mount for accessibility
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const goNext = useCallback(() => {
    if (step < STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      onDismiss();
    }
  }, [step, onDismiss]);

  const goPrev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (delta < -50) goNext();
      else if (delta > 50) goPrev();
    },
    [goNext, goPrev],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Enter" || e.key === " ") goNext();
    },
    [goNext, goPrev],
  );

  const current = steps[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Welcome to Dugout, step ${step + 1} of ${STEPS}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-pitch-900 bg-opacity-98 px-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      ref={containerRef}
      tabIndex={-1}
      style={{ outline: "none" }}
    >
      {/* Ember gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-ember-gradient" aria-hidden="true" />

      <div className="flex flex-col items-center gap-8 w-full max-w-sm">
        {/* Illustration */}
        <div
          className="motion-safe:animate-[fadeSlideUp_0.4s_ease-out]"
          aria-hidden="true"
          key={step}
        >
          {current.illustration}
        </div>

        {/* Text */}
        <div className="text-center space-y-3" key={`text-${step}`}>
          <h2
            className="font-display text-3xl font-black text-pitch-50 leading-tight motion-safe:animate-[fadeSlideUp_0.35s_ease-out_0.05s_both]"
          >
            {current.headingTemplate(firstName)}
          </h2>
          <p className="text-pitch-200 text-base leading-relaxed motion-safe:animate-[fadeSlideUp_0.35s_ease-out_0.1s_both]">
            {current.body}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={goNext}
          className="w-full min-h-[52px] bg-ember text-white font-display font-black text-lg rounded-xl active:opacity-80 transition-opacity motion-safe:animate-[fadeSlideUp_0.35s_ease-out_0.15s_both]"
          aria-label={step === STEPS - 1 ? "Finish onboarding and go to schedule" : `Go to step ${step + 2} of ${STEPS}`}
        >
          {current.cta}
        </button>

        {/* Progress dots */}
        <div className="flex gap-2" role="tablist" aria-label="Onboarding progress">
          {Array.from({ length: STEPS }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}`}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-ember" : "w-2 bg-pitch-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
