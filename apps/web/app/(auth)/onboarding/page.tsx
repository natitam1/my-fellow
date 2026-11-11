import { Suspense } from "react";
import type { Metadata } from "next";
import { OnboardingForm } from "@/components/auth/OnboardingForm";

export const metadata: Metadata = {
  title: "Complete Your Profile | 4 Kilo Fellowship",
  description:
    "Personalize your 4 Kilo Fellowship profile: ministry teams, year of study, department, and avatar.",
};

export default function OnboardingPage() {
  return (
    <div className="min-h-[calc(100vh-12rem)] py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Suspense
        fallback={
          <div className="h-[600px] w-full max-w-2xl mx-auto animate-pulse rounded-xl bg-muted/40" />
        }
      >
        <OnboardingForm />
      </Suspense>
    </div>
  );
}
