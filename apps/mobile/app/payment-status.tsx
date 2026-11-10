import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";
import { useVerifyJamiPaymentMutation } from "@/queries/giving.queries";

export default function PaymentStatusScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const params = useLocalSearchParams<{
    sessionId?: string;
    tx_ref?: string;
  }>();
  const verifyMutation = useVerifyJamiPaymentMutation();
  const [status, setStatus] = useState<"checking" | "success" | "failed">(
    "checking",
  );
  const [message, setMessage] = useState("Verifying payment transaction...");

  const refToVerify = params.sessionId || params.tx_ref;

  useEffect(() => {
    let isMounted = true;

    async function checkStatus() {
      if (!refToVerify) {
        setStatus("failed");
        setMessage("No transaction reference was provided.");
        return;
      }

      try {
        const result = await verifyMutation.mutateAsync(refToVerify);
        if (!isMounted) return;

        if (result.status === "success" || result.status === "completed") {
          setStatus("success");
          setMessage("Your transaction has been verified successfully!");
        } else if (result.status === "failed") {
          setStatus("failed");
          setMessage("The payment transaction was not completed.");
        } else {
          // Still pending: check once more after a brief delay
          setTimeout(async () => {
            if (!isMounted) return;
            try {
              const secondResult = await verifyMutation.mutateAsync(refToVerify);
              if (!isMounted) return;
              if (
                secondResult.status === "success" ||
                secondResult.status === "completed"
              ) {
                setStatus("success");
                setMessage("Your transaction has been verified successfully!");
              } else {
                setStatus("failed");
                setMessage("The transaction is pending or was cancelled.");
              }
            } catch {
              if (isMounted) {
                setStatus("failed");
                setMessage("Could not confirm transaction status.");
              }
            }
          }, 3000);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("failed");
        setMessage(err?.message || "Failed to verify payment status.");
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [refToVerify]);

  const bg = isDark ? "#121214" : "#FFFFFF";
  const textColor = isDark ? "#FAFAFA" : "#0F172A";
  const subTextColor = isDark ? "#A1A1AA" : "#64748B";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {status === "checking" && (
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={[styles.title, { color: textColor }]}>
            Verifying Payment
          </Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {message}
          </Text>
        </View>
      )}

      {status === "success" && (
        <View style={styles.content}>
          <View style={styles.iconCircleSuccess}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={[styles.title, { color: textColor }]}>
            Payment Successful!
          </Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {message}
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)/gifts" as any)}
          >
            <Text style={styles.buttonText}>Return to Fellowship</Text>
          </Pressable>
        </View>
      )}

      {status === "failed" && (
        <View style={styles.content}>
          <View style={styles.iconCircleFailed}>
            <Ionicons name="alert-circle" size={64} color="#EF4444" />
          </View>
          <Text style={[styles.title, { color: textColor }]}>
            Payment Incomplete
          </Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {message}
          </Text>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)" as any)}
          >
            <Text style={styles.buttonText}>Return Home</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  iconCircleSuccess: {
    marginBottom: 20,
  },
  iconCircleFailed: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
