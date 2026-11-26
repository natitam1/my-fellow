import { useAuth } from "@/context/AuthContext";
import { useAppStore } from "@/stores/app.store";
import { useUserStore } from "@/stores/user.store";
import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  const { authState } = useAuth();
  const hasCompletedOnboarding = useAppStore(
    (state) => state.hasCompletedOnboarding,
  );
  const hasAppHydrated = useAppStore((state) => state._hasHydrated);
  const user = useUserStore((state) => state.user);
  const hasUserHydrated = useUserStore((state) => state._hasHydrated);

  if (authState.authenticated === null || !hasUserHydrated || !hasAppHydrated) {
    return null;
  }

  let destination: string;
  if (!hasCompletedOnboarding) {
    destination = "/onboarding";
  } else if (authState.authenticated) {
    if (user && (!user.fullName || !user.department)) {
      destination = "/(auth)/personalization";
    } else {
      destination = "/(tabs)";
    }
  } else {
    destination = "/(auth)/sign-in";
  }

  return <Redirect href={destination as any} />;
}
