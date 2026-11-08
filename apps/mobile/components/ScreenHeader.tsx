import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { NativeBackButton } from "./ui/NativeBackButton";
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  borderBottom?: boolean;
};

/**
 * ScreenHeader - Standard header matching prime-capital design:
 * - Perfectly centered title (absolutely positioned with pointerEvents="none")
 * - 44x44 circular back button (Apple HIG 44pt touch target)
 * - Centered arrow-back icon with theme-aware ripple and iOS active state
 * - Balanced right slot with placeholder
 */
export function ScreenHeader({
  title,
  onBack,
  rightAction,
  style,
  containerStyle,
  borderBottom = true,
}: ScreenHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  const headerTopInset = Math.max(insets.top + 6, 12);

  const bgColor = isDark ? "#0A0A0A" : "#ffffff";
  const borderColor = isDark ? "#1f2937" : "#e5e7eb";
  const titleColor = isDark ? "#ffffff" : "#0f172a";

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: headerTopInset,
          backgroundColor: bgColor,
          borderBottomWidth: borderBottom ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: borderColor,
        },
        containerStyle,
      ]}
    >
      <View style={[styles.centeredRow, style]}>
        <NativeBackButton
          onPress={onBack}
          size={44}
          variant="light"
          accessibilityLabel="Go back"
        />

        <View style={styles.titleCenterContainer} pointerEvents="none">
          {title ? (
            <Text
              style={[styles.centeredTitle, { color: titleColor }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : null}
        </View>

        <View style={styles.rightSlot}>
          {rightAction || <View style={styles.placeholderBtn} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    justifyContent: "center",
    zIndex: 20,
  },
  centeredRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    position: "relative",
  },
  titleCenterContainer: {
    position: "absolute",
    left: 56,
    right: 56,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  rightSlot: {
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  placeholderBtn: {
    width: 44,
    height: 44,
  },
});

export default ScreenHeader;
