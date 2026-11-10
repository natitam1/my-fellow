import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface SettingsPreferences {
  pushNotifications: boolean;
  eventReminders: boolean;
  devotionReminders: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoPlay: boolean;
  dataSync: boolean;
}

interface SettingsState extends SettingsPreferences {
  setPreference: <K extends keyof SettingsPreferences>(
    key: K,
    value: SettingsPreferences[K],
  ) => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: SettingsPreferences = {
  pushNotifications: true,
  eventReminders: true,
  devotionReminders: true,
  soundEnabled: true,
  vibrationEnabled: true,
  autoPlay: false,
  dataSync: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setPreference: (key, value) => set({ [key]: value } as Partial<SettingsState>),
      resetPreferences: () => set({ ...DEFAULT_PREFERENCES }),
    }),
    {
      name: "fellowship-settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
