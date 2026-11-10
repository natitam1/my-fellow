import {
  focusManager,
  QueryClient,
} from "@tanstack/react-query";
import { AppState, AppStateStatus, Platform } from "react-native";

export function onAppStateChange(status: AppStateStatus): void {
  if (Platform.OS !== "web") {
    focusManager.setFocused(status === "active");
  }
}

let appStateListenerRegistered = false;

export function setupReactQueryAppStateListener(): void {
  if (appStateListenerRegistered || Platform.OS === "web") return;
  appStateListenerRegistered = true;
  AppState.addEventListener("change", onAppStateChange);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute fresh window
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 2,
      refetchOnMount: true,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
