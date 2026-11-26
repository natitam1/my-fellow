"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            4 Kilo Fellowship · AAU ECSF
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Critical application error
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            An unexpected error interrupted the application. Try reloading the
            page or heading back to the home page.
          </p>

          {error.digest && (
            <p className="mt-4 rounded-lg bg-muted/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try Again
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.assign("/");
              }}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Return Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
