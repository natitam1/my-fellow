import { User } from "@/types/auth.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface UserState {
  user: User | null;
  _hasHydrated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setHasHydrated: (val: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      setHasHydrated: (val) => set({ _hasHydrated: val }),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
