import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 max-w-lg w-full">
            <h1 className="text-2xl font-black text-rose-600 mb-4">Oops! Something went wrong.</h1>
            <p className="text-slate-600 mb-6 font-medium">
              The application encountered a runtime error. Please try refreshing the page.
            </p>
            <div className="bg-slate-100 p-4 rounded-xl mb-6 overflow-auto max-h-40 text-xs font-mono text-slate-800">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white py-3 rounded-xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
