import type { FC, ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-pitch-700 flex items-center justify-center mb-5 text-pitch-300">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl font-700 uppercase tracking-wide text-pitch-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-pitch-300 mb-8 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl bg-ember text-white text-sm font-display font-600 uppercase tracking-wider active:bg-ember-600 w-full max-w-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
