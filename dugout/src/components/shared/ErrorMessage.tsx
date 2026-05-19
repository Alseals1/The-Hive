import type { FC } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: FC<ErrorMessageProps> = ({
  message = "Something went wrong. Please try again.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-red-950 flex items-center justify-center mb-3">
        <AlertTriangle size={20} className="text-red-400" />
      </div>
      <p className="text-pitch-300 text-sm mb-5 max-w-xs leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-xl bg-pitch-700 text-pitch-100 text-sm font-display font-600 uppercase tracking-wider active:bg-pitch-600"
        >
          Try again
        </button>
      )}
    </div>
  );
};
