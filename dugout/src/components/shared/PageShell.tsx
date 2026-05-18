import type { FC, ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  /** Use when a BottomNav is present — adds 64px padding to avoid overlap */
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
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {header && (
        <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
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

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="flex items-center justify-between px-4 py-4">
    <div>
      <h1 className="text-xl font-bold text-dugout-dark leading-tight">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-dugout-mid mt-0.5">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);
