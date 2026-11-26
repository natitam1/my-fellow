import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";
import * as Updates from "expo-updates";
import Toast from "react-native-toast-message";

const OTA_CHECK_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

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
    runtimeVersion:
      typeof Updates.runtimeVersion === "string"
        ? Updates.runtimeVersion
        : "2.0.0",
    updateId: Updates.updateId ?? null,
    createdAt: Updates.createdAt ?? null,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
  };
}

export function useOTAUpdates(autoCheckOnMount = true) {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdateReady, setIsUpdateReady] = useState(false);
  const isCheckingRef = useRef(false);
  const lastCheckAtRef = useRef(0);

  const reloadApp = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // no-op if reload fails
    }
  }, []);

  const checkAndApplyUpdate = useCallback(
    async (options?: {
      silent?: boolean;
    }): Promise<"updated" | "up-to-date" | "disabled" | "error"> => {
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

      if (isCheckingRef.current) {
        return "up-to-date";
      }

      const now = Date.now();
      if (silent && now - lastCheckAtRef.current < OTA_CHECK_COOLDOWN_MS) {
        return "up-to-date";
      }

      isCheckingRef.current = true;
      lastCheckAtRef.current = now;

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
        setIsUpdateReady(true);

        // Do NOT force-restart abruptly without user interaction while actively using the app.
        // Instead, notify the user and give them control over when to restart.
        if (!silent) {
          Alert.alert(
            "Update Ready",
            "A new update has been downloaded. Would you like to restart the app now to apply it?",
            [
              { text: "Later", style: "cancel" },
              {
                text: "Restart Now",
                onPress: () => {
                  reloadApp();
                },
              },
            ],
          );
        } else {
          Toast.show({
            type: "info",
            text1: "Update Ready",
            text2: "Restart the app at your convenience to apply the latest update.",
            visibilityTime: 6000,
            onPress: () => {
              reloadApp();
            },
          });
        }

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
        isCheckingRef.current = false;
        setIsChecking(false);
        setIsDownloading(false);
      }
    },
    [reloadApp],
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
    isUpdateReady,
    reloadApp,
    checkAndApplyUpdate,
    updateInfo: getOTAUpdateInfo(),
  };
}
