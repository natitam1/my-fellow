import { ConfirmModal, InfoModal, ScreenHeader } from "@/components";
import { PRIMARY } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useOTAUpdates } from "@/hooks/useOTAUpdates";
import { JoinRequest, joinRequestService } from "@/services/joinRequestService";
import { useSettingsStore } from "@/stores/settings.store";
import { useUserStore } from "@/stores/user.store";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import Constants from "expo-constants";
import { Image as ExpoImage } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SettingItem {
  id: string;
  icon: string;
  iconFamily?: "ionicons" | "material" | "community";
  label: string;
  description?: string;
  type: "navigation" | "toggle" | "action";
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
  badge?: string;
}

interface Section {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  const { authState, logout, deleteAccount, getCurrentUser } = useAuth();
  const { user } = useUserStore();
  const isAuthenticated = authState.authenticated === true;

  const {
    pushNotifications,
    eventReminders,
    devotionReminders,
    soundEnabled,
    vibrationEnabled,
    autoPlay,
    dataSync,
    setPreference,
  } = useSettingsStore();

  const { isChecking, isDownloading, checkAndApplyUpdate, updateInfo } =
    useOTAUpdates(false);

  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const showInfoModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setInfoModal({ visible: true, title, message, type });
  };

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        getCurrentUser().catch(() => {});
        joinRequestService
          .getMyRequests()
          .then(setRequests)
          .catch(() => {});
      }
    }, [isAuthenticated, getCurrentUser]),
  );

  const handleAuthRequired = (action: () => void) => {
    if (!isAuthenticated) {
      setShowSignInPrompt(true);
    } else {
      action();
    }
  };

  const confirmSignOut = async () => {
    setShowSignOutConfirm(false);
    try {
      await logout();
      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const confirmDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await deleteAccount();
      setShowDeleteConfirm(false);
      showInfoModal(
        "Account Deleted",
        "Your account and personal data have been removed.",
        "success",
      );
      setTimeout(() => {
        router.replace("/(auth)/sign-in");
      }, 1200);
    } catch (err: any) {
      setShowDeleteConfirm(false);
      showInfoModal(
        "Error",
        err.message || "Could not delete your account. Please try again.",
        "error",
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleClearCache = async () => {
    try {
      await ExpoImage.clearDiskCache();
      await ExpoImage.clearMemoryCache();
      showInfoModal(
        "Storage Cleared",
        "Image and offline caches were safely cleared. Fresh content will reload automatically.",
        "success",
      );
    } catch {
      showInfoModal(
        "Cache Cleared",
        "Your temporary cache has been cleared successfully.",
        "success",
      );
    }
  };

  const handleManualOtaCheck = async () => {
    const res = await checkAndApplyUpdate({ silent: false });
    if (res === "up-to-date") {
      showInfoModal(
        "Up to Date",
        `You have the latest build (v${Constants.expoConfig?.version || "2.0.0"} - ${updateInfo.channel}).`,
        "success",
      );
    }
  };

  const appVersion = Constants.expoConfig?.version || "2.0.0";

  const sections: Section[] = useMemo(() => {
    const base: Section[] = [
      {
        title: "Account",
        items: [
          {
            id: "profile",
            icon: "person-outline",
            label: "Edit Profile",
            description: "Update your name, bio, photo, and year of study",
            type: "navigation",
            onPress: () =>
              handleAuthRequired(() => router.push("/edit-profile")),
          },
          {
            id: "phone",
            icon: "call-outline",
            label: "Phone Number",
            description: user?.phoneNumber || "Not set",
            type: "navigation",
            onPress: () =>
              handleAuthRequired(() => router.push("/update-phone")),
          },
        ],
      },
      {
        title: "Appearance",
        items: [
          {
            id: "theme",
            icon: isDark ? "moon" : "sunny-outline",
            label: "Dark Mode",
            description: isDark
              ? "Dark theme active"
              : "Clean light theme active",
            type: "toggle",
            value: isDark,
            onToggle: toggleTheme,
          },
        ],
      },
      {
        title: "Notifications & Alerts",
        items: [
          {
            id: "pushNotifications",
            icon: "notifications-outline",
            label: "Push Notifications",
            description: "Announcements, reminders, and fellowship news",
            type: "toggle",
            value: pushNotifications,
            onToggle: (v) => setPreference("pushNotifications", v),
          },
          {
            id: "eventReminders",
            icon: "calendar-outline",
            label: "Event & Program Alerts",
            description: "Receive reminders 30m before gatherings start",
            type: "toggle",
            value: eventReminders,
            onToggle: (v) => setPreference("eventReminders", v),
          },
          {
            id: "devotionReminders",
            icon: "book-outline",
            label: "Daily Devotion Reminders",
            description: "Morning prayer and scripture notification",
            type: "toggle",
            value: devotionReminders,
            onToggle: (v) => setPreference("devotionReminders", v),
          },
          {
            id: "sound",
            icon: "volume-high-outline",
            label: "Notification Sound",
            description: "Play audible chime on alerts",
            type: "toggle",
            value: soundEnabled,
            onToggle: (v) => setPreference("soundEnabled", v),
          },
          {
            id: "vibration",
            icon: "phone-portrait-outline",
            label: "Vibration",
            description: "Vibrate on alerts and reminders",
            type: "toggle",
            value: vibrationEnabled,
            onToggle: (v) => setPreference("vibrationEnabled", v),
          },
        ],
      },
      {
        title: "Media & Storage",
        items: [
          {
            id: "autoPlay",
            icon: "play-circle-outline",
            label: "Auto-play Media",
            description: "Play audio devotions automatically",
            type: "toggle",
            value: autoPlay,
            onToggle: (v) => setPreference("autoPlay", v),
          },
          {
            id: "dataSync",
            icon: "sync-outline",
            label: "Background Sync",
            description: "Keep devotions and programs available offline",
            type: "toggle",
            value: dataSync,
            onToggle: (v) => setPreference("dataSync", v),
          },
          {
            id: "clearCache",
            icon: "trash-outline",
            label: "Clear Cached Images",
            description: "Free local storage without deleting saved data",
            type: "action",
            onPress: handleClearCache,
          },
        ],
      },
      {
        title: "Updates & System",
        items: [
          {
            id: "otaUpdates",
            icon: "cloud-download-outline",
            label: "Check for Updates",
            description: isChecking
              ? "Checking for latest fellowship patches..."
              : isDownloading
                ? "Downloading update in background..."
                : `Version 2.0.0 (${updateInfo.channel})`,
            type: "action",
            badge: updateInfo.isEnabled ? "OTA Active" : "Store Build",
            onPress: handleManualOtaCheck,
          },
        ],
      },
      {
        title: "Support & Fellowship",
        items: [
          {
            id: "help",
            icon: "chatbubble-ellipses-outline",
            label: "Help & Support Enquiry",
            description: "Direct message the fellowship admin team",
            type: "navigation",
            onPress: () => router.push("/help"),
          },
          {
            id: "contact",
            icon: "call-outline",
            label: "Fellowship Hotline",
            description: "0911000002",
            type: "action",
            onPress: () => Linking.openURL("tel:0911000002"),
          },
          {
            id: "telegram",
            icon: "paper-plane-outline",
            label: "Telegram Community",
            description: "@natitam1 / 4 Kilo Fellowship",
            type: "action",
            onPress: () => Linking.openURL("https://t.me/natitam1"),
          },
          {
            id: "about",
            icon: "information-circle-outline",
            label: "About 4 Kilo ECSF",
            description: "Learn about the fellowship mission and leaders",
            type: "navigation",
            onPress: () => router.push("/about"),
          },
        ],
      },
      {
        title: "Legal",
        items: [
          {
            id: "privacy",
            icon: "shield-checkmark-outline",
            label: "Privacy Policy",
            type: "navigation",
            onPress: () => router.push("/(auth)/legal?doc=privacy"),
          },
          {
            id: "terms",
            icon: "document-text-outline",
            label: "Terms of Service",
            type: "navigation",
            onPress: () => router.push("/(auth)/legal?doc=terms"),
          },
        ],
      },
    ];

    if (isAuthenticated) {
      base.push({
        title: "Account Actions",
        items: [
          {
            id: "signOut",
            icon: "log-out-outline",
            label: "Sign Out",
            description: "Log out of this device",
            type: "action",
            danger: true,
            onPress: () => setShowSignOutConfirm(true),
          },
          {
            id: "deleteAccount",
            icon: "trash-outline",
            label: "Delete Account",
            description: "Permanently delete your profile and personal data",
            type: "action",
            danger: true,
            onPress: () => setShowDeleteConfirm(true),
          },
        ],
      });
    }

    return base;
  }, [
    isAuthenticated,
    isDark,
    user?.phoneNumber,
    pushNotifications,
    eventReminders,
    devotionReminders,
    soundEnabled,
    vibrationEnabled,
    autoPlay,
    dataSync,
    isChecking,
    isDownloading,
    updateInfo,
    router,
  ]);

  const renderItemIcon = (item: SettingItem) => {
    const iconColor = item.danger
      ? "#ef4444"
      : isDark
        ? "#f4f4f5"
        : PRIMARY;

    const iconBg = item.danger
      ? isDark
        ? "rgba(239, 68, 68, 0.15)"
        : "#fee2e2"
      : isDark
        ? "rgba(255, 103, 25, 0.12)"
        : "#fff7ed";

    return (
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: iconBg },
        ]}
      >
        <Ionicons name={item.icon as any} size={20} color={iconColor} />
      </View>
    );
  };

  const renderItem = (item: SettingItem, isLast: boolean) => {
    return (
      <Pressable
        key={item.id}
        onPress={() => {
          if (item.type === "toggle") {
            item.onToggle?.(!item.value);
          } else {
            item.onPress?.();
          }
        }}
        android_ripple={{
          color: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
        }}
        style={[
          styles.row,
          !isLast && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9",
          },
        ]}
      >
        {renderItemIcon(item)}

        <View style={styles.rowContent}>
          <View style={styles.titleWrap}>
            <Text
              style={[
                styles.itemLabel,
                {
                  color: item.danger
                    ? "#ef4444"
                    : isDark
                      ? "#ffffff"
                      : "#0f172a",
                },
              ]}
            >
              {item.label}
            </Text>
            {item.badge ? (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 103, 25, 0.2)"
                      : "#ffedd5",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: isDark ? "#fb923c" : "#c2410c" },
                  ]}
                >
                  {item.badge}
                </Text>
              </View>
            ) : null}
          </View>

          {item.description ? (
            <Text
              style={[
                styles.itemDesc,
                { color: isDark ? "#94a3b8" : "#64748b" },
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
        </View>

        {item.type === "toggle" ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{
              false: isDark ? "#3f3f46" : "#cbd5e1",
              true: PRIMARY,
            }}
            thumbColor={Platform.OS === "android" ? "#ffffff" : undefined}
          />
        ) : item.type === "navigation" ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? "#52525b" : "#94a3b8"}
          />
        ) : null}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isDark ? "#0A0A0A" : "#f8fafc" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader title="Settings" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(bottom + 40, 60) },
        ]}
      >
        {/* User Card when logged in */}
        {isAuthenticated && user ? (
          <View
            style={[
              styles.userCard,
              {
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                borderColor: isDark ? "#27272a" : "#e2e8f0",
              },
            ]}
          >
            <View style={styles.userCardInner}>
              <View style={styles.userAvatar}>
                {user.profileImage ? (
                  <ExpoImage
                    source={{ uri: user.profileImage }}
                    style={styles.avatarImg}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatarFallback,
                      { backgroundColor: PRIMARY },
                    ]}
                  >
                    <Text style={styles.avatarInitial}>
                      {(user.fullName || "F").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.userInfo}>
                <Text
                  style={[
                    styles.userName,
                    { color: isDark ? "#ffffff" : "#0f172a" },
                  ]}
                >
                  {user.fullName || "Fellowship Member"}
                </Text>
                <Text
                  style={[
                    styles.userPhone,
                    { color: isDark ? "#a1a1aa" : "#64748b" },
                  ]}
                >
                  {user.phoneNumber}
                </Text>
                {user.role ? (
                  <View style={styles.roleTag}>
                    <Text style={styles.roleTagText}>
                      {user.role.toUpperCase().replace(/_/g, " ")}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

        {/* Setting Sections */}
        {sections.map((section) => (
          <View key={section.title} style={styles.sectionWrap}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#a1a1aa" : "#64748b" },
              ]}
            >
              {section.title}
            </Text>
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                  borderColor: isDark ? "#27272a" : "#e2e8f0",
                },
              ]}
            >
              {section.items.map((item, idx) =>
                renderItem(item, idx === section.items.length - 1),
              )}
            </View>
          </View>
        ))}

        {/* Footer info */}
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerAppTitle,
              { color: isDark ? "#f4f4f5" : "#0f172a" },
            ]}
          >
            My Fellow • 4 Kilo Fellowship
          </Text>
          <Text
            style={[
              styles.footerVersion,
              { color: isDark ? "#71717a" : "#94a3b8" },
            ]}
          >
            v{appVersion} • AAU ECSF Ecosystem
          </Text>
        </View>
      </ScrollView>

      {/* Confirmation Modals */}
      <ConfirmModal
        visible={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        isDark={isDark}
        icon="log-out-outline"
        iconColor="#ef4444"
        title="Sign Out"
        description="Are you sure you want to sign out of your fellowship account on this device?"
        buttons={[
          {
            label: "Sign Out",
            onPress: confirmSignOut,
            variant: "danger",
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />

      <ConfirmModal
        visible={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        isDark={isDark}
        icon="log-in-outline"
        iconColor={PRIMARY}
        title="Sign In Required"
        description="Please sign in with your Ethiopian phone number to manage your profile."
        buttons={[
          {
            label: "Sign In",
            onPress: () => {
              setShowSignInPrompt(false);
              router.push("/(auth)/sign-in");
            },
            variant: "primary",
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />

      <ConfirmModal
        visible={showDeleteConfirm}
        onClose={() => !deletingAccount && setShowDeleteConfirm(false)}
        isDark={isDark}
        icon="trash-outline"
        iconColor="#ef4444"
        title="Delete Account Permanently"
        description="This will permanently delete your fellowship profile, posts, and data. This action cannot be reversed. Are you completely sure?"
        buttons={[
          {
            label: deletingAccount ? "Deleting..." : "Permanently Delete",
            onPress: confirmDeleteAccount,
            variant: "danger",
          },
        ]}
        cancelButton={{
          label: "Cancel",
          onPress: () => !deletingAccount && setShowDeleteConfirm(false),
        }}
      />

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  userCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  userCardInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: "hidden",
    marginRight: 14,
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  userPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  roleTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  roleTagText: {
    color: PRIMARY,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
  sectionWrap: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 6,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
    marginRight: 8,
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.1,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    alignItems: "center",
    marginTop: 14,
    marginBottom: 20,
  },
  footerAppTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  footerVersion: {
    fontSize: 11,
    marginTop: 3,
  },
});
