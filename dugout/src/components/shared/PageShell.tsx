import type { FC, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

interface PageShellProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  withNav?: boolean;
  className?: string;
}

export const PageShell: FC<PageShellProps> = ({
  children,
  header,
  footer,
  withNav = false,
  className = "",
}) => {
  return (
    <div className="min-h-screen bg-pitch-900 flex flex-col">
      {header && (
        <header className="bg-pitch-900 border-b border-pitch-700 sticky top-0 z-10 backdrop-blur-sm">
          {header}
        </header>
      )}
      <main id="main-content" className={`flex-1 ${withNav ? "pb-20" : ""} ${className}`}>
        {children}
      </main>
      {footer}
    </div>
  );
};

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backTo?: string;
  backLabel?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, action, backTo, backLabel = "My Teams" }) => (
  <div className="px-4 pt-2 pb-3">
    {backTo && (
      <Link
        to={backTo}
        className="flex items-center gap-0.5 text-[11px] font-display font-600 uppercase tracking-wider text-pitch-400 active:text-pitch-200 mb-1 w-fit"
      >
        <ChevronLeft size={13} strokeWidth={2.5} />
        {backLabel}
      </Link>
    )}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-display text-2xl font-700 tracking-wide text-pitch-50 uppercase leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs font-body font-medium text-pitch-300 mt-0.5 tracking-wide">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  </div>
);
