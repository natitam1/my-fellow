import { MainTabHeader } from "@/components/MainTabHeader";
import CartSheet from "@/components/Marketplace/CartSheet";
import { InfoModal } from "@/components/Modals/InfoModal";
import { ReasonModal } from "@/components/Modals/ReasonModal";
import { GivingCelebrationModal } from "@/components/Modals/GivingCelebrationModal";
import { API_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import {
  useInitJamiPaymentMutation,
  useMyGivingsQuery,
  useVerifyJamiPaymentMutation,
} from "@/queries/giving.queries";
import { useProductsInfiniteQuery } from "@/queries/marketplace.queries";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { usePaymentStore } from "@/stores/payment.store";
import { useUserStore } from "@/stores/user.store";
import { getProductImage, getProductPrice } from "@/types/marketplace.types";
import { donationSchema } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { PRIMARY } from "@/constants/colors";
import * as z from "zod";

type DonationForm = z.infer<typeof donationSchema>;

const Gifts = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [reasonModalVisible, setReasonModalVisible] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [lastSuccessDetails, setLastSuccessDetails] = useState<{
    amount: number;
    reason: string;
    txRef: string;
  } | null>(null);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isVerifyingRef = useRef(false);
  const [pendingDonationData, setPendingDonationData] =
    useState<DonationForm | null>(null);

  const isTyping = isAmountFocused;

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: isTyping ? { display: "none" } : undefined,
    });
  }, [navigation, isTyping]);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const {
    cartVisible,
    setCartVisible,
    getCartCount,
  } = useMarketplaceStore();

  const cartCount = getCartCount();

  const { user } = useUserStore();
  const { txRef, setTxRef } = usePaymentStore();
  const {
    totalGivingsAmount,
    refetch: refetchMyGivings,
  } = useMyGivingsQuery();
  const {
    products: featuredProducts,
    refetch: refetchFeaturedProducts,
  } = useProductsInfiniteQuery("All", 6);
  const initJamiMutation = useInitJamiPaymentMutation();
  const verifyJamiMutation = useVerifyJamiPaymentMutation();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchMyGivings(), refetchFeaturedProducts()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchMyGivings, refetchFeaturedProducts]);

  const showInfoModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setInfoModal({ visible: true, title, message, type });
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const selectedAmount = watch("amount");

  useEffect(() => {
    const loadSavedAmount = async () => {
      const savedAmount = await AsyncStorage.getItem("last_donation_amount");
      if (savedAmount) {
        const parsed = parseFloat(savedAmount);
        if (!isNaN(parsed) && parsed > 0) {
          setValue("amount", parsed);
        }
      }
    };
    loadSavedAmount();
  }, [setValue]);

  // Handle deep linking for payment return
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { path, queryParams } = Linking.parse(event.url);
      if (path === "payment-status" || event.url.includes("payment-status")) {
        WebBrowser.dismissBrowser();
        const refToVerify =
          (typeof queryParams?.sessionId === "string" &&
            queryParams.sessionId) ||
          txRef;
        if (refToVerify) {
          verifyPaymentWithRetry(refToVerify);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    return () => subscription.remove();
  }, [txRef, pendingDonationData]);

  const verifyPaymentWithRetry = async (
    ref: string,
    attempt = 1,
    maxAttempts = 3,
    silentIfPending = false,
  ) => {
    if (isVerifyingRef.current && attempt === 1) return;
    isVerifyingRef.current = true;
    setLoading(true);

    try {
      const verifyResult = await verifyJamiMutation.mutateAsync(ref);
      const data = verifyResult.data;
      const status = verifyResult.status;

      if (status === "success" || status === "completed") {
        const confirmedAmount =
          data?.amount || pendingDonationData?.amount || selectedAmount || 0;
        const confirmedReason =
          data?.reason || (data as any)?.metadata?.reason || "Gift";

        setLastSuccessDetails({
          amount: confirmedAmount,
          reason: confirmedReason,
          txRef: ref,
        });
        setCelebrationVisible(true);
        refetchMyGivings();
        setTxRef(null);
        return;
      }

      // If still pending after first check, retry with backoff (webhook might be in flight)
      if (status === "pending" && attempt < maxAttempts) {
        setTimeout(() => {
          isVerifyingRef.current = false;
          verifyPaymentWithRetry(ref, attempt + 1, maxAttempts, silentIfPending);
        }, attempt * 1500);
        return;
      }

      if (silentIfPending && (status === "pending" || status === "open")) {
        // User closed browser before completing payment without error
        setTxRef(null);
        return;
      }

      const failureMsg =
        data?.failure?.message ||
        "The payment was not completed or was cancelled. Please try again.";
      showInfoModal("Payment Incomplete", failureMsg, "error");
      setTxRef(null);
    } catch (error) {
      if (attempt < maxAttempts) {
        setTimeout(() => {
          isVerifyingRef.current = false;
          verifyPaymentWithRetry(ref, attempt + 1, maxAttempts, silentIfPending);
        }, 1500);
        return;
      }
      if (!silentIfPending) {
        showInfoModal(
          "Verification Error",
          "Could not confirm payment status with the server. Please check your givings history.",
          "error",
        );
      }
      setTxRef(null);
    } finally {
      isVerifyingRef.current = false;
      setLoading(false);
    }
  };

  const onGivePress = (data: DonationForm) => {
    if (!user) {
      router.push("/(auth)/sign-in" as any);
      return;
    }

    if (!data.amount || data.amount < 1) {
      showInfoModal(
        "Invalid Amount",
        "Please enter an amount of at least 1 ETB to give.",
      );
      return;
    }

    setPendingDonationData(data);
    setReasonModalVisible(true);
  };

  const handleInitializePayment = async (reason: string) => {
    if (!pendingDonationData) return;
    const data = pendingDonationData;

    setReasonModalVisible(false);
    setLoading(true);

    try {
      const payload = {
        amount: data.amount,
        email: user?.email?.trim() || "finance@4kilofellowship.org",
        phone: user?.phoneNumber,
        reason: reason,
        returnUrl: `${API_URL}/payments/success`,
      };

      const initRes = await initJamiMutation.mutateAsync(payload);
      const checkout_url = initRes.checkoutUrl;
      const sessionOrRef = initRes.sessionOrRef;

      setTxRef(sessionOrRef);

      if (data.amount) {
        await AsyncStorage.setItem("last_donation_amount", String(data.amount));
      }

      // Ensure user's phone number is prefilled on jami.bio web page
      let launchUrl = checkout_url;
      const donorPhone = user?.phoneNumber;
      if (launchUrl && donorPhone && !launchUrl.includes("phone=")) {
        const rawDigits = donorPhone.replace(/\D/g, "");
        const localFormat = rawDigits.startsWith("251")
          ? "0" + rawDigits.slice(3)
          : rawDigits.startsWith("0")
            ? rawDigits
            : "0" + rawDigits;
        const intlFormat = rawDigits.startsWith("0")
          ? "251" + rawDigits.slice(1)
          : rawDigits.startsWith("251")
            ? rawDigits
            : "251" + rawDigits;

        const sep = launchUrl.includes("?") ? "&" : "?";
        launchUrl = `${launchUrl}${sep}phone=${encodeURIComponent(localFormat)}&phoneNumber=${encodeURIComponent(localFormat)}&customer_phone=${encodeURIComponent(intlFormat)}&msisdn=${encodeURIComponent(localFormat)}`;
      }

      // openAuthSessionAsync catches redirect back to my-fellow://payment-status and auto-dismisses
      const authResult = await WebBrowser.openAuthSessionAsync(
        launchUrl,
        "my-fellow://payment-status",
      );

      if (authResult.type === "success") {
        const { queryParams } = Linking.parse(authResult.url);
        const refToVerify =
          (typeof queryParams?.sessionId === "string" &&
            queryParams.sessionId) ||
          sessionOrRef;
        if (refToVerify) {
          await verifyPaymentWithRetry(refToVerify);
        }
      } else if (sessionOrRef) {
        // User closed or dismissed browser: verify quietly in case payment was already submitted
        await verifyPaymentWithRetry(sessionOrRef, 1, 1, true);
      }
    } catch (error: any) {
      console.error("Payment initialization failed:", error);
      showInfoModal(
        "Error",
        error.response?.data?.message ||
          error.message ||
          "Failed to start payment process.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <View className={`flex-1 ${isDark ? "bg-dark" : "bg-background"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <MainTabHeader
        borderBottom={true}
        title="Gifts"
        rightExtra={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }
                router.push("/marketplace/orders" as any);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
              }}
              accessibilityLabel="View Orders"
            >
              <Ionicons
                name="receipt-outline"
                size={18}
                color={isDark ? "#FAFAFA" : "#0F172A"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }
                setCartVisible(true);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)",
                position: "relative",
              }}
              accessibilityLabel="View Shopping Cart"
            >
              <Ionicons
                name="cart-outline"
                size={19}
                color={isDark ? "#FAFAFA" : "#0F172A"}
              />
              {cartCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    backgroundColor: PRIMARY,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 3,
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 10,
                      fontWeight: "800",
                    }}
                  >
                    {cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        }
      />

      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
        >
            {/* donation header section */}
            <View className="px-5 mb-10 pt-4 items-center">
              <View className="flex-row items-center justify-center">
                <Ionicons
                  name="hand-left-outline"
                  size={80}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                  style={{ marginRight: -10 }}
                />
                <Ionicons
                  name="hand-right-outline"
                  size={80}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                  style={{ marginLeft: -10 }}
                />
              </View>
              <View className="h-4" />
              <Text
                className={`text-center leading-8 text-[17px] font-medium px-4 tracking-wide ${isDark ? "text-zinc-400 italic" : "text-zinc-600 italic"}`}
              >
                “እግዚአብሔር በደስታ የሚሰጠውን ይወዳልና እያንዳንዱ በልቡ እንዳሰበ ይስጥ፥ በኀዘን ወይም በግድ
                አይደለም።”
              </Text>
              <View className="h-[2px] w-12 bg-zinc-200 dark:bg-zinc-800 my-6 rounded-full" />
              <Text className="text-zinc-400 font-bold text-xs tracking-widest">
                2ኛ ቆሮንቶስ 9፥7
              </Text>
            </View>

            {/* Total Givings Native Button */}
            <View
              style={{
                marginHorizontal: 16,
                marginBottom: 24,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                backgroundColor: isDark ? "rgba(24, 24, 27, 0.7)" : "#ffffff",
                overflow: "hidden",
              }}
            >
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light,
                    ).catch(() => {});
                  }
                  router.push("/givings" as any);
                }}
                unstable_pressDelay={0}
                accessibilityRole="button"
                accessibilityLabel="View your total givings"
                android_ripple={{
                  color: isDark
                    ? "rgba(255, 255, 255, 0.14)"
                    : "rgba(0, 0, 0, 0.08)",
                  borderless: false,
                  foreground: true,
                }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      width: "100%",
                      minHeight: 84,
                      paddingVertical: 20,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      opacity: Platform.OS === "ios" && pressed ? 0.7 : 1,
                    }}
                  >
                    <Ionicons name="gift" size={28} color="#ff6719" />
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Your Total Givings
                      </Text>
                      <Text
                        className={`text-2xl font-black ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        {totalGivingsAmount.toLocaleString()} ETB
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={isDark ? "#a1a1aa" : "#71717a"}
                    />
                  </View>
                )}
              </Pressable>
            </View>

            {/* gifts section */}
            <View className="px-5 mb-12">
              <View>
                {/* form  */}
                <View className="gap-5">
                  <View>
                    <Text
                      className={`text-[11px] font-black uppercase tracking-widest mb-2 ml-1 ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      Amount to Give (ETB)
                    </Text>
                    <Controller
                      control={control}
                      name="amount"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <View
                          onTouchStart={() => setIsAmountFocused(true)}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            height: 54,
                            paddingHorizontal: 16,
                            gap: 10,
                            borderRadius: 16,
                            borderWidth: isAmountFocused ? 1.5 : 1,
                            borderColor: errors.amount
                              ? "#ef4444"
                              : isAmountFocused
                                ? PRIMARY
                                : isDark
                                  ? "#27272a"
                                  : "#e4e4e7",
                            backgroundColor: isDark ? "#18181b" : "#fafafa",
                          }}
                        >
                          <Ionicons
                            name="cash-outline"
                            size={20}
                            color={
                              errors.amount
                                ? "#ef4444"
                                : isAmountFocused
                                  ? PRIMARY
                                  : isDark
                                    ? "#71717a"
                                    : "#a1a1aa"
                            }
                          />
                          <TextInput
                            style={{
                              flex: 1,
                              height: "100%",
                              fontSize: 17,
                              fontWeight: "700",
                              color: isDark ? "#ffffff" : "#000000",
                              paddingVertical: 0,
                            }}
                            placeholder="0.00"
                            placeholderTextColor={
                              isDark ? "#52525b" : "#a1a1aa"
                            }
                            selectionColor={PRIMARY}
                            keyboardType="numeric"
                            onFocus={() => setIsAmountFocused(true)}
                            onBlur={() => {
                              setIsAmountFocused(false);
                              onBlur();
                              if (value) {
                                AsyncStorage.setItem(
                                  "last_donation_amount",
                                  String(value),
                                ).catch(() => {});
                              }
                            }}
                            onChangeText={(text) => {
                              const num = parseFloat(text);
                              const finalVal = isNaN(num) ? 0 : num;
                              onChange(finalVal);
                              if (text) {
                                AsyncStorage.setItem(
                                  "last_donation_amount",
                                  text,
                                ).catch(() => {});
                              }
                            }}
                            value={value === 0 ? "" : value.toString()}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: isAmountFocused
                                ? PRIMARY
                                : isDark
                                  ? "#71717a"
                                  : "#a1a1aa",
                            }}
                          >
                            ETB
                          </Text>
                        </View>
                      )}
                    />
                    {errors.amount && (
                      <Text className="text-red-500 text-xs mt-1.5 ml-2 font-bold">
                        {errors.amount.message}
                      </Text>
                    )}
                  </View>
                </View>

                <View
                  style={{
                    width: "100%",
                    borderRadius: 9999,
                    overflow: "hidden",
                    marginTop: 32,
                    backgroundColor: loading ? "#a1a1aa" : "#ff6719",
                  }}
                >
                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light,
                        ).catch(() => {});
                      }
                      handleSubmit(onGivePress)();
                    }}
                    disabled={loading}
                    unstable_pressDelay={0}
                    accessibilityRole="button"
                    accessibilityLabel={`Give ${selectedAmount || 0} ETB`}
                    android_ripple={
                      !loading
                        ? {
                            color: "rgba(255, 255, 255, 0.28)",
                            borderless: false,
                            foreground: true,
                          }
                        : undefined
                    }
                  >
                    {({ pressed }) => (
                      <View
                        style={{
                          width: "100%",
                          height: 56,
                          paddingHorizontal: 24,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          opacity:
                            Platform.OS === "ios" && pressed && !loading
                              ? 0.8
                              : 1,
                        }}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <Text
                              style={{
                                color: "#ffffff",
                                fontWeight: "700",
                                fontSize: 17,
                              }}
                            >
                              Give {selectedAmount || 0} ETB
                            </Text>
                            <Ionicons
                              name="arrow-forward"
                              size={20}
                              color="#fff"
                            />
                          </>
                        )}
                      </View>
                    )}
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Fellowship Store Native Button */}
            <View
              style={{
                marginHorizontal: 16,
                marginBottom: featuredProducts.length > 0 ? 20 : 40,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDark ? "#27272a" : "#e4e4e7",
                backgroundColor: isDark ? "rgba(24, 24, 27, 0.7)" : "#ffffff",
                overflow: "hidden",
              }}
            >
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(
                      Haptics.ImpactFeedbackStyle.Light,
                    ).catch(() => {});
                  }
                  router.push("/marketplace" as any);
                }}
                unstable_pressDelay={0}
                accessibilityRole="button"
                accessibilityLabel="View fellowship store"
                android_ripple={{
                  color: isDark
                    ? "rgba(255, 255, 255, 0.14)"
                    : "rgba(0, 0, 0, 0.08)",
                  borderless: false,
                  foreground: true,
                }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      width: "100%",
                      minHeight: 84,
                      paddingVertical: 20,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      opacity: Platform.OS === "ios" && pressed ? 0.7 : 1,
                    }}
                  >
                    <Ionicons name="bag-handle" size={28} color="#ff6719" />
                    <View style={{ flex: 1, justifyContent: "center" }}>
                      <Text
                        className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        Fellowship Store
                      </Text>
                      <Text
                        numberOfLines={1}
                        className={`text-2xl font-black ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        Official Merch
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={22}
                      color={isDark ? "#a1a1aa" : "#71717a"}
                    />
                  </View>
                )}
              </Pressable>
            </View>

            {/* Live Featured Store Preview Strip */}
            {featuredProducts.length > 0 && (
              <View style={{ marginBottom: 40 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "800",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      color: isDark ? "#a1a1aa" : "#71717a",
                    }}
                  >
                    Featured Store Items
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/marketplace" as any)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text
                      style={{
                        fontSize: 12.5,
                        fontWeight: "700",
                        color: PRIMARY,
                      }}
                    >
                      See All
                    </Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    gap: 12,
                  }}
                >
                  {featuredProducts.slice(0, 6).map((item) => {
                    const imgUri = getProductImage(item);
                    const itemPrice = getProductPrice(item);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.85}
                        onPress={() =>
                          router.push(`/marketplace/${item.id}` as any)
                        }
                        style={{
                          width: 148,
                          borderRadius: 18,
                          borderWidth: 1,
                          borderColor: isDark ? "#27272a" : "#e4e4e7",
                          backgroundColor: isDark ? "#18181b" : "#ffffff",
                          overflow: "hidden",
                        }}
                      >
                        <Image
                          source={{ uri: imgUri }}
                          style={{
                            width: "100%",
                            height: 124,
                            backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                          }}
                          contentFit="cover"
                          transition={200}
                          cachePolicy="memory-disk"
                        />
                        <View style={{ padding: 10 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 13,
                              fontWeight: "700",
                              color: isDark ? "#fafafa" : "#18181b",
                              marginBottom: 2,
                            }}
                          >
                            {item.title || item.name}
                          </Text>
                          <Text
                            style={{
                              fontSize: 12.5,
                              fontWeight: "800",
                              color: PRIMARY,
                            }}
                          >
                            {itemPrice.toFixed(0)} ETB
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        </View>
      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
      <CartSheet
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        isDark={isDark}
      />
      <ReasonModal
        visible={reasonModalVisible}
        onClose={() => setReasonModalVisible(false)}
        onSubmit={handleInitializePayment}
        isDark={isDark}
      />
      <GivingCelebrationModal
        visible={celebrationVisible}
        onClose={() => {
          setCelebrationVisible(false);
          setLastSuccessDetails(null);
        }}
        amount={lastSuccessDetails?.amount || 0}
        reason={lastSuccessDetails?.reason}
        txRef={lastSuccessDetails?.txRef}
        isDark={isDark}
      />
    </View>
  );
};

export default Gifts;
