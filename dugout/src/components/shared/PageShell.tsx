import type { FC, ReactNode } from "react";

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
      <main className={`flex-1 ${withNav ? "pb-20" : ""} ${className}`}>
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
}

export const PageHeader: FC<PageHeaderProps> = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between px-4 py-3">
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
);
