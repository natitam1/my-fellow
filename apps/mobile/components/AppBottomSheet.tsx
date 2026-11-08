import React, { useEffect } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  isDark?: boolean;
  snapPoints?: ("half" | "full")[];
}

export const AppBottomSheet: React.FC<AppBottomSheetProps> = ({
  visible,
  onClose,
  children,
  isDark = false,
  snapPoints = ["half", "full"],
}) => {
  const insets = useSafeAreaInsets();
  const containerBg = isDark ? "#18181b" : "#ffffff";
  const handleColor = isDark ? "#3f3f46" : "#cbd5e1";

  // Dismiss keyboard when sheet opens
  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
    }
  }, [visible]);

  if (!visible) return null;

  const isHalfOnly = snapPoints.length === 1 && snapPoints[0] === "half";
  const maxHeight = isHalfOnly ? "55%" : "85%";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop: Tap outside to close */}
        <Pressable
          style={[
            styles.backdrop,
            {
              backgroundColor: isDark
                ? "rgba(0, 0, 0, 0.72)"
                : "rgba(0, 0, 0, 0.5)",
            },
          ]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
        />

        {/* Bottom Sheet Surface */}
        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: containerBg,
              maxHeight,
              paddingBottom: Math.max(insets.bottom, 16),
            },
          ]}
        >
          {/* Top Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: handleColor }]} />
          </View>

          {/* Sheet Body Content */}
          <View style={styles.sheetContent}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  handleContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4.5,
    borderRadius: 3,
  },
  sheetContent: {
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
});

export default AppBottomSheet;
