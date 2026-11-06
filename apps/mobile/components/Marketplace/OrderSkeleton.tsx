import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface OrderSkeletonProps {
  isDark: boolean;
}

const SkeletonBox = ({
  width,
  height,
  borderRadius = 8,
  isDark,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  isDark: boolean;
  style?: any;
}) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.65, { duration: 750 }),
        withTiming(0.3, { duration: 750 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: isDark ? "#2c2c2e" : "#e2e8f0",
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const OrderSkeleton = ({ isDark }: OrderSkeletonProps) => {
  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <View style={styles.container}>
        <SkeletonBox
          width={64}
          height={64}
          borderRadius={16}
          isDark={isDark}
        />
        <View style={styles.info}>
          <View style={styles.header}>
            <SkeletonBox
              width="60%"
              height={15}
              borderRadius={6}
              isDark={isDark}
            />
            <SkeletonBox
              width={70}
              height={22}
              borderRadius={8}
              isDark={isDark}
            />
          </View>
          <SkeletonBox
            width={90}
            height={11}
            borderRadius={4}
            isDark={isDark}
            style={{ marginTop: 6 }}
          />
          <View style={styles.footer}>
            <SkeletonBox
              width={50}
              height={12}
              borderRadius={4}
              isDark={isDark}
            />
            <SkeletonBox
              width={75}
              height={16}
              borderRadius={6}
              isDark={isDark}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export const OrderSkeletonList = ({
  count = 3,
  isDark,
}: {
  count?: number;
  isDark: boolean;
}) => {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
      {Array.from({ length: count }).map((_, index) => (
        <OrderSkeleton key={index} isDark={isDark} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F1F1F1",
  },
  cardDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "#2C2C2E",
  },
  container: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
});
