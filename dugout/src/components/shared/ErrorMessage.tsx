import type { FC } from "react";

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
      <div className="text-4xl mb-3">⚠️</div>
      <p className="text-dugout-mid text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 rounded-xl bg-brand-500 text-white text-sm font-semibold active:bg-brand-600"
        >
          Try again
        </button>
      )}
    </div>
  );
};
