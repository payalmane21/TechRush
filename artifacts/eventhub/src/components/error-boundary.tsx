import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-destructive/40 shadow-2xl rounded-3xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <CardTitle className="font-serif font-bold text-2xl text-foreground">
                Application Exception Intercepted
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                EventHub security boundary caught an unexpected UI render error. Your data is safe.
              </CardDescription>
            </div>

            {this.state.error && (
              <div className="p-3 bg-muted/60 rounded-2xl border text-left text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button onClick={this.handleReload} className="flex-1 font-bold text-xs bg-primary text-primary-foreground">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reload Application
              </Button>
              <Button onClick={this.handleGoHome} variant="outline" className="flex-1 font-bold text-xs">
                <Home className="w-3.5 h-3.5 mr-1.5" /> Return Home
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
