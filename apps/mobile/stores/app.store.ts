import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AppState {
  hasSeenFeatures: boolean;
  setHasSeenFeatures: (value: boolean) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasSeenFeatures: false,
      setHasSeenFeatures: (value) => set({ hasSeenFeatures: value }),
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (value) =>
        set({ hasCompletedOnboarding: value }),
      _hasHydrated: false,
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenFeatures: state.hasSeenFeatures,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
