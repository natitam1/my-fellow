import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "Login | 4 Kilo Fellowship",
  description:
    "Sign in to 4 Kilo Christian Students Fellowship with your Ethiopian phone number or leader credentials.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="h-96 w-full max-w-md mx-auto animate-pulse rounded-xl bg-muted/40" />
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
