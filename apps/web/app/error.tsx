"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <AlertTriangle className="h-7 w-7" aria-hidden="true" />
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          4 Kilo Fellowship · AAU ECSF
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          We ran into an unexpected issue while loading this page. Please try
          again, or return to the home page.
        </p>

        {error.digest && (
          <p className="mt-4 rounded-lg bg-muted/60 px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            onClick={reset}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-border"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
