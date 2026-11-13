"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface Props {
  children?: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught frontend error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-red-500/30 bg-red-950/20 text-center">
          <div className="h-12 w-12 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center text-red-400 mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            {this.props.fallbackTitle || "An unexpected error occurred"}
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-md">
            {this.state.error?.message || "Component rendering failed. Please try refreshing."}
          </p>
          <Button
            variant="secondary"
            className="mt-4 gap-2"
            onClick={() => this.setState({ hasError: false })}
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
