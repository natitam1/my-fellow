import Link from "next/link";
import Image from "next/image";
import { BookOpen, Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Image
            src="/images/logo-primary.png"
            alt="4 Kilo Fellowship logo"
            width={34}
            height={34}
            className="object-contain"
          />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Compass className="h-3.5 w-3.5" aria-hidden="true" />
          404 · Page Not Found
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          The link you followed may have moved or no longer exists. Head back to
          the 4 Kilo Fellowship home page or explore today&apos;s devotionals.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" aria-hidden="true" />
              Return Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full sm:w-auto border-border"
          >
            <Link href="/devotions">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Daily Devotions
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
