import { ScreenHeader } from "@/components/ScreenHeader";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useMyGivingsQuery } from "@/queries/giving.queries";
import { GivingRecord } from "@/stores/payment.store";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const GivingItem = ({
  item,
  isDark,
}: {
  item: GivingRecord;
  isDark: boolean;
}) => {
  const date = new Date(item.createdAt);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isSuccess = item.status === "success" || item.status === "completed";

  return (
    <View
      className={`mb-4 p-5 rounded-[24px] border ${
        isDark ? "bg-[#111] border-[#222]" : "bg-white border-zinc-100"
      }`}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${isSuccess ? "bg-green-500/10" : "bg-orange-500/10"}`}
          >
            <Ionicons
              name={isSuccess ? "checkmark-circle" : "time"}
              size={20}
              color={isSuccess ? "#10b981" : "#f97316"}
            />
          </View>
          <View>
            <Text
              className={`text-base font-bold ${isDark ? "text-white" : "text-black"}`}
            >
              {item.reason || "General Offering"}
            </Text>
            <Text
              className={`text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
            >
              {formattedDate} • {formattedTime}
            </Text>
          </View>
        </View>
        <Text
          className={`text-lg font-black ${isDark ? "text-white" : "text-black"}`}
        >
          {item.amount.toLocaleString()} ETB
        </Text>
      </View>

      <View className="flex-row items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <View
          className={`px-3 py-1 rounded-full ${isSuccess ? "bg-green-500/10" : "bg-orange-500/10"}`}
        >
          <Text
            className={`text-[9px] font-bold uppercase tracking-wider ${isSuccess ? "text-green-500" : "text-orange-500"}`}
          >
            {item.status}
          </Text>
        </View>
        <Text className="text-[10px] font-medium text-zinc-400">
          Ref: {item.tx_ref ? item.tx_ref.substring(0, 15) : "N/A"}...
        </Text>
      </View>
    </View>
  );
};

const GivingsScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const {
    myGivings,
    totalGivingsAmount,
    isLoadingGivings,
    isBackgroundRefetching,
    isError,
    errorMessage,
    refetch: fetchMyGivings,
  } = useMyGivingsQuery();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#f8fafc" },
      ]}
    >
      <LinearGradient
        colors={isDark ? ["#0a0a0a", "#000000"] : ["#ffffff", "#f1f5f9"]}
        style={StyleSheet.absoluteFill}
      />
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <ScreenHeader
        title="My Giving History"
        containerStyle={{
          backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
          borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
        }}
      />

      {isLoadingGivings && myGivings.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={myGivings}
          keyExtractor={(item) => item._id || item.tx_ref}
          ListHeaderComponent={
            <View className="px-5 pt-8 mb-6">
              <View
                className={`p-8 rounded-[32px] ${
                  isDark ? "bg-zinc-900" : "bg-white"
                } border ${isDark ? "border-zinc-800" : "border-zinc-100"}`}
              >
                <Text className="text-zinc-500 text-[10px] font-black uppercase tracking-[2px] mb-2">
                  Total Contribution
                </Text>
                <View className="flex-row items-baseline">
                  <Text
                    className={`text-5xl font-black ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {totalGivingsAmount.toLocaleString()}
                  </Text>
                  <Text className="ml-3 text-orange-500 font-bold text-lg">
                    ETB
                  </Text>
                </View>
              </View>
            </View>
          }
          renderItem={({ item }) => <GivingItem item={item} isDark={isDark} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isBackgroundRefetching}
              onRefresh={() => {
                fetchMyGivings();
              }}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
          ListEmptyComponent={
            isError ? (
              <View className="py-20 items-center justify-center px-6">
                <Ionicons
                  name="cloud-offline-outline"
                  size={44}
                  color="#ef4444"
                />
                <Text
                  className={`text-base font-bold mt-4 ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
                >
                  Could not load givings
                </Text>
                <Text
                  className={`text-xs mt-1 text-center ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  {errorMessage || "Please check your connection and try again."}
                </Text>
                <TouchableOpacity
                  onPress={() => fetchMyGivings()}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: 20,
                    backgroundColor: PRIMARY,
                  }}
                >
                  <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 13 }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="py-20 items-center justify-center">
                <View
                  className={`w-20 h-20 rounded-[28px] items-center justify-center mb-6 ${isDark ? "bg-zinc-900" : "bg-gray-50"}`}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={40}
                    color={isDark ? "#333" : "#ddd"}
                  />
                </View>
                <Text
                  className={`text-base font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                >
                  No history found
                </Text>
                <Text
                  className={`text-xs mt-2 ${isDark ? "text-zinc-600" : "text-zinc-300"}`}
                >
                  Your donations will appear here
                </Text>
              </View>
            )
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default GivingsScreen;
