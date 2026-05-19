import type { FC } from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`rounded-full border-pitch-700 border-t-ember animate-spin ${sizeClasses[size]} ${className}`}
    />
  );
};

export const FullPageSpinner: FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-pitch-900">
    <LoadingSpinner size="lg" />
  </div>
);
