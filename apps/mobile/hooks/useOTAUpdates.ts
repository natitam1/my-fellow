import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";
import * as Updates from "expo-updates";
import Toast from "react-native-toast-message";

export interface OTAUpdateInfo {
  isEnabled: boolean;
  channel: string;
  runtimeVersion: string;
  updateId: string | null;
  createdAt: Date | null;
  isEmbeddedLaunch: boolean;
}

export function getOTAUpdateInfo(): OTAUpdateInfo {
  return {
    isEnabled: Updates.isEnabled,
    channel: Updates.channel || (__DEV__ ? "development" : "production"),
    runtimeVersion: typeof Updates.runtimeVersion === "string" ? Updates.runtimeVersion : "2.0.0",
    updateId: Updates.updateId ?? null,
    createdAt: Updates.createdAt ?? null,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
  };
}

export function useOTAUpdates(autoCheckOnMount = true) {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const checkAndApplyUpdate = useCallback(
    async (options?: { silent?: boolean }): Promise<
      "updated" | "up-to-date" | "disabled" | "error"
    > => {
      const silent = options?.silent ?? false;

      if (__DEV__ || !Updates.isEnabled) {
        if (!silent) {
          Toast.show({
            type: "info",
            text1: "Development Build",
            text2: "OTA updates are active on preview and production builds.",
          });
        }
        return "disabled";
      }

      try {
        setIsChecking(true);
        const update = await Updates.checkForUpdateAsync();

        if (!update.isAvailable) {
          setUpdateAvailable(false);
          if (!silent) {
            Toast.show({
              type: "success",
              text1: "You're Up to Date",
              text2: "You already have the latest version installed.",
            });
          }
          return "up-to-date";
        }

        setUpdateAvailable(true);
        setIsChecking(false);
        setIsDownloading(true);

        if (!silent) {
          Toast.show({
            type: "info",
            text1: "Downloading Update...",
            text2: "Applying the latest fellowship improvements.",
          });
        }

        await Updates.fetchUpdateAsync();
        setIsDownloading(false);

        Toast.show({
          type: "success",
          text1: "Update Ready",
          text2: "Restarting to apply the new update...",
        });

        setTimeout(() => {
          Updates.reloadAsync().catch(() => {});
        }, 900);

        return "updated";
      } catch {
        if (!silent) {
          Toast.show({
            type: "error",
            text1: "Update Check Failed",
            text2: "Could not reach the update server. Please try again later.",
          });
        }
        return "error";
      } finally {
        setIsChecking(false);
        setIsDownloading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!autoCheckOnMount || __DEV__ || !Updates.isEnabled) return;

    checkAndApplyUpdate({ silent: true });

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        checkAndApplyUpdate({ silent: true });
      }
    });

    return () => {
      sub.remove();
    };
  }, [autoCheckOnMount, checkAndApplyUpdate]);

  return {
    isChecking,
    isDownloading,
    updateAvailable,
    checkAndApplyUpdate,
    updateInfo: getOTAUpdateInfo(),
  };
}
