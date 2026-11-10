import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <>
      <Stack.Screen options={{ title: "Oops!", headerShown: true }} />
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#121214" : "#FFFFFF" },
        ]}
      >
        <Text
          style={[styles.title, { color: isDark ? "#FAFAFA" : "#0F172A" }]}
        >
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
});
