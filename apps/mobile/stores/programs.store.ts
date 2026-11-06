import { programService } from "@/services/programService";
import { Program } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const DAY_ORDER: Record<string, number> = {
  monday: 1,
  "monday - friday": 2,
  "all days": 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
  sunday: 8,
};

const sortPrograms = (list: Program[]): Program[] => {
  return [...list].sort((a, b) => {
    // Keep Monday General Service pinned first
    const aIsMonday = (a.title || "").toLowerCase().includes("monday");
    const bIsMonday = (b.title || "").toLowerCase().includes("monday");
    if (aIsMonday && !bIsMonday) return -1;
    if (!aIsMonday && bIsMonday) return 1;

    const dayA = (a.day || "").toLowerCase().trim();
    const dayB = (b.day || "").toLowerCase().trim();
    const orderA = DAY_ORDER[dayA] ?? 99;
    const orderB = DAY_ORDER[dayB] ?? 99;

    if (orderA !== orderB) return orderA - orderB;
    return (a.title || "").localeCompare(b.title || "");
  });
};

interface ProgramsState {
  programs: Program[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  loadPrograms: (forceRefresh?: boolean) => Promise<void>;
  setPrograms: (programs: Program[]) => void;
  createProgram: (data: FormData | any) => Promise<Program>;
  updateProgram: (id: string, data: FormData | any) => Promise<Program>;
  deleteProgram: (id: string) => Promise<boolean>;
}

export const useProgramsStore = create<ProgramsState>()(
  persist(
    (set, get) => ({
      programs: [],
      loading: false,
      refreshing: false,
      error: null,

      setPrograms: (programs) => set({ programs: sortPrograms(programs) }),

      loadPrograms: async (forceRefresh = false) => {
        const hasData = get().programs.length > 0;

        if (forceRefresh) {
          set({ refreshing: true, error: null });
        } else if (!hasData) {
          set({ loading: true, error: null });
        }

        try {
          const data = await programService.fetchPrograms();
          const sorted = sortPrograms(data || []);
          set({ programs: sorted, error: null });
        } catch (error: any) {
          console.error("Failed to sync programs:", error);
          if (!hasData) {
            set({ error: error.message || "Failed to fetch programs" });
          }
        } finally {
          set({ loading: false, refreshing: false });
        }
      },

      createProgram: async (data: FormData | any) => {
        const newProgram = await programService.createProgram(data);
        const normalized: Program = {
          ...newProgram,
          id: String((newProgram as any).id || (newProgram as any)._id),
        };
        set((state) => ({
          programs: sortPrograms([normalized, ...state.programs]),
        }));
        return normalized;
      },

      updateProgram: async (id: string, data: FormData | any) => {
        const updated = await programService.updateProgram(id, data);
        const normalized: Program = {
          ...updated,
          id: String((updated as any).id || (updated as any)._id || id),
        };
        set((state) => ({
          programs: sortPrograms(
            state.programs.map((p) =>
              p.id === id || (p as any)._id === id ? normalized : p,
            ),
          ),
        }));
        return normalized;
      },

      deleteProgram: async (id: string) => {
        const success = await programService.deleteProgram(id);
        if (success) {
          set((state) => ({
            programs: state.programs.filter(
              (p) => p.id !== id && (p as any)._id !== id,
            ),
          }));
        }
        return success;
      },
    }),
    {
      name: "programs-storage-v3",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
