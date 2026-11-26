import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

export function useNetwork() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const wasConnectedRef = useRef<boolean | null>(null);

  const performReachabilityPing = useCallback(async (): Promise<boolean> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      // Active reachability check triggered only on offline-to-online transition or manual refresh
      const response = await fetch("https://www.google.com", {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      const isReachable = response.ok || response.type === "opaque";
      setIsConnected(isReachable);
      return isReachable;
    } catch {
      setIsConnected(false);
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  }, []);

  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    const hasConnection = Boolean(state.isConnected);
    if (!hasConnection) {
      setIsConnected(false);
      return;
    }
    await performReachabilityPing();
  }, [performReachabilityPing]);

  useEffect(() => {
    // Initial status check from native NetInfo module
    NetInfo.fetch().then((state: NetInfoState) => {
      const connected = Boolean(state.isConnected);
      wasConnectedRef.current = connected;
      if (!connected) {
        setIsConnected(false);
      } else if (state.isInternetReachable !== null) {
        setIsConnected(Boolean(state.isInternetReachable));
      } else {
        setIsConnected(true);
      }
    });

    // Primary connectivity tracking via native event listener without polling
    const unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const currentlyConnected = Boolean(state.isConnected);
      const previouslyConnected = wasConnectedRef.current;
      wasConnectedRef.current = currentlyConnected;

      if (!currentlyConnected) {
        setIsConnected(false);
        return;
      }

      // If transitioning from offline to online, perform active reachability ping
      if (previouslyConnected === false) {
        performReachabilityPing();
      } else if (state.isInternetReachable !== null) {
        setIsConnected(Boolean(state.isInternetReachable));
      } else {
        setIsConnected(true);
      }
    });

    // Check reachability if resuming from background after being offline
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextAppState: AppStateStatus) => {
        if (nextAppState === "active") {
          NetInfo.fetch().then((state: NetInfoState) => {
            const connected = Boolean(state.isConnected);
            if (!connected) {
              setIsConnected(false);
            } else if (wasConnectedRef.current === false) {
              wasConnectedRef.current = true;
              performReachabilityPing();
            } else if (state.isInternetReachable !== null) {
              setIsConnected(Boolean(state.isInternetReachable));
            }
          });
        }
      },
    );

    return () => {
      unsubscribeNetInfo();
      appStateSubscription.remove();
    };
  }, [performReachabilityPing]);

  return { isConnected, refresh };
}
