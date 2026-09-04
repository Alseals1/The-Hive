import { useState, useEffect } from "react";
import type { FC } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = "md",
  label,
  className = "",
}) => {
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    if (!label) return;
    const timer = setTimeout(() => setShowLabel(true), 500);
    return () => clearTimeout(timer);
  }, [label]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="status"
        aria-label={label || "Loading"}
        className={`rounded-full border-pitch-700 border-t-ember animate-spin ${sizeClasses[size]} ${className}`}
      />
      {label && showLabel && (
        <p className="text-xs font-body text-pitch-400">{label}</p>
      )}
    </div>
  );
};

export const FullPageSpinner: FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-pitch-900">
    <LoadingSpinner size="lg" />
  </div>
);
