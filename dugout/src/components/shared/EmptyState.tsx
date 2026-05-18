import type { FC } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon = "📭",
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-dugout-dark mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-dugout-mid mb-6 max-w-xs">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl bg-brand-500 text-white text-base font-semibold active:bg-brand-600 w-full max-w-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
