import React from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

export interface NativeBackButtonProps {
  onPress?: () => void;
  variant?: "plain" | "light" | "dark" | "ghost" | "glass";
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number | { top: number; bottom: number; left: number; right: number };
  accessibilityLabel?: string;
}

/**
 * NativeBackButton - Modular, platform-perfect circular back button:
 * - Perfectly bounded circular Material ripple on Android (borderless: true, radius: size / 2)
 * - Tactile iOS scale (0.94) and opacity feedback (Apple HIG standard)
 * - Smooth haptic touch feedback
 * - Safe navigation (router.canGoBack() ? router.back() : router.replace('/(tabs)'))
 * - Automatic platform icon (chevron-back on iOS, arrow-back on Android)
 */
export const NativeBackButton: React.FC<NativeBackButtonProps> = ({
  onPress,
  variant = "plain",
  iconName,
  iconColor,
  size = 40,
  iconSize,
  style,
  hitSlop = 8,
  accessibilityLabel = "Go back",
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handlePress = () => {
    if (Platform.OS !== "web") {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }

    if (onPress) {
      onPress();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const defaultIcon =
    iconName || (Platform.OS === "ios" ? "chevron-back" : "arrow-back");

  const isLightOverlay = variant === "dark" || variant === "glass";
  const defaultIconColor =
    iconColor ||
    (isLightOverlay
      ? "#ffffff"
      : isDark
      ? "#f3f4f6"
      : "#0f172a");

  const borderRadius = size / 2;

  const backgroundColor =
    variant === "light"
      ? isDark
        ? "rgba(255, 255, 255, 0.08)"
        : "rgba(0, 0, 0, 0.04)"
      : variant === "dark"
      ? "rgba(255, 255, 255, 0.15)"
      : variant === "glass"
      ? "rgba(0, 0, 0, 0.35)"
      : "transparent";

  const defaultIconSize =
    iconSize ||
    (defaultIcon === "chevron-back" ? Math.round(size * 0.6) : Math.round(size * 0.55));

  const rippleColor = isLightOverlay
    ? "rgba(255, 255, 255, 0.25)"
    : isDark
    ? "rgba(255, 255, 255, 0.16)"
    : "rgba(0, 0, 0, 0.10)";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      hitSlop={hitSlop}
      android_ripple={{
        color: rippleColor,
        borderless: true,
        radius: borderRadius,
      }}
      style={({ pressed }) => [
        styles.iconBtn,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor,
          opacity: pressed ? (Platform.OS === "ios" ? 0.6 : 0.85) : 1,
          transform:
            Platform.OS === "ios" && pressed ? [{ scale: 0.94 }] : undefined,
        },
        style,
      ]}
    >
      <Ionicons
        name={defaultIcon}
        size={defaultIconSize}
        color={defaultIconColor}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  iconBtn: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

export default NativeBackButton;
