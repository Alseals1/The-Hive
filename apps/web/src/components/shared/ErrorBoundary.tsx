import { Component } from "react";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;
    if (fallback) return fallback;

    return (
      <div className="min-h-screen bg-pitch-900 flex flex-col items-center justify-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-red-950 flex items-center justify-center mb-3">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <h1 className="font-display text-2xl font-700 uppercase tracking-wide text-pitch-50 mb-2">
          Something went wrong
        </h1>
        <p className="text-base font-body text-pitch-400 mb-8 text-center max-w-xs">
          Something broke unexpectedly. Give it another shot or head back to your teams.
        </p>
        <div className="flex flex-col xs:flex-row gap-3">
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-6 py-2.5 rounded-xl bg-pitch-700 text-pitch-100 text-sm font-display font-600 uppercase tracking-wider active:bg-pitch-600"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/teams")}
            className="py-3.5 px-8 rounded-xl bg-ember text-white font-display font-700 uppercase tracking-wider text-sm active:bg-ember-600"
          >
            Go to My Teams
          </button>
        </div>
      </div>
    );
  }
}
