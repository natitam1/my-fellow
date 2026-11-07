import { MainTabHeader } from "@/components/MainTabHeader";
import CartSheet from "@/components/Marketplace/CartSheet";
import { InfoModal } from "@/components/Modals/InfoModal";
import { ReasonModal } from "@/components/Modals/ReasonModal";
import { GivingCelebrationModal } from "@/components/Modals/GivingCelebrationModal";
import { API_URL } from "@/constants/api";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { usePaymentStore } from "@/stores/payment.store";
import { useUserStore } from "@/stores/user.store";
import { getProductImage } from "@/types/marketplace.types";
import { donationSchema } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import * as Linking from "expo-linking";
import { useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
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
    products,
    fetchProducts,
    cartVisible,
    setCartVisible,
    getCartCount,
  } = useMarketplaceStore();

  const cartCount = getCartCount();

  useEffect(() => {
    fetchProducts(true, 10, "All");
  }, [fetchProducts]);

  const storeThumbnails = useMemo(() => {
    const list: string[] = [];
    for (const p of products) {
      const img = p.imageUrls?.[0] || p.image || p.imageUrl;
      if (img && typeof img === "string" && !img.includes("via.placeholder.com")) {
        list.push(img);
      }
      if (list.length >= 3) break;
    }
    return list;
  }, [products]);

  const { user } = useUserStore();
  const { txRef, setTxRef, totalGivingsAmount, fetchMyGivings } =
    usePaymentStore();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchMyGivings(),
        fetchProducts(true, 10, "All"),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchMyGivings, fetchProducts]);

  const showInfoModal = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    setInfoModal({ visible: true, title, message, type });
  };

  useEffect(() => {
    fetchMyGivings();
  }, []);

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
      const response = await api.get(`/payments/jami/verify/${ref}`);
      const data = response.data.data || response.data;
      const status = data?.status || response.data.status;

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
        fetchMyGivings();
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
        email: user?.email?.trim() || "206413681+natitam1@users.noreply.github.com",
        phone: user?.phoneNumber,
        reason: reason,
        returnUrl: `${API_URL}/payments/success`,
      };

      const response = await api.post("/payments/jami/init", payload);
      const checkout_url =
        response.data.data?.checkout_url ||
        response.data.data?.checkoutUrl ||
        response.data.checkout_url;
      const sessionOrRef =
        response.data.data?.sessionId ||
        response.data.sessionId ||
        response.data.data?.tx_ref ||
        response.data.tx_ref;

      if (!checkout_url) {
        throw new Error("Invalid checkout URL received from server");
      }

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

            {/* FELLOWSHIP STORE REDIRECTION BANNER */}
            <View
              style={[
                styles.storeBannerWrapper,
                {
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.16)"
                    : "rgba(0, 0, 0, 0.12)",
                },
              ]}
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
                accessibilityLabel="Visit Fellowship Store"
                android_ripple={{
                  color: isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.06)",
                  borderless: false,
                  foreground: true,
                }}
                style={({ pressed }) => [
                  styles.storeBannerCard,
                  {
                    opacity: Platform.OS === "ios" && pressed ? 0.75 : 1,
                  },
                ]}
              >
                {/* Left: 3 Overlapping Sticker Images Illustration */}
                <View style={styles.stickersContainer}>
                  {/* Sticker 1: tilted left */}
                  <View
                    style={[
                      styles.stickerBadge,
                      styles.sticker1,
                      {
                        borderColor: isDark ? "#3f3f46" : "#ffffff",
                      },
                    ]}
                  >
                    {storeThumbnails[0] ? (
                      <ExpoImage
                        source={{ uri: storeThumbnails[0] }}
                        style={styles.stickerImg}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View
                        style={[
                          styles.stickerFallback,
                          { backgroundColor: isDark ? "#27272a" : "#f1f5f9" },
                        ]}
                      >
                        <Ionicons
                          name="shirt-outline"
                          size={20}
                          color={PRIMARY}
                        />
                      </View>
                    )}
                  </View>

                  {/* Sticker 2: tilted right */}
                  <View
                    style={[
                      styles.stickerBadge,
                      styles.sticker2,
                      {
                        borderColor: isDark ? "#3f3f46" : "#ffffff",
                      },
                    ]}
                  >
                    {storeThumbnails[1] ? (
                      <ExpoImage
                        source={{ uri: storeThumbnails[1] }}
                        style={styles.stickerImg}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View
                        style={[
                          styles.stickerFallback,
                          { backgroundColor: isDark ? "#27272a" : "#fef3c7" },
                        ]}
                      >
                        <Ionicons name="sparkles" size={18} color="#f59e0b" />
                      </View>
                    )}
                  </View>

                  {/* Sticker 3: front center / highlighted */}
                  <View
                    style={[
                      styles.stickerBadge,
                      styles.sticker3,
                      { borderColor: PRIMARY },
                    ]}
                  >
                    {storeThumbnails[2] ? (
                      <ExpoImage
                        source={{ uri: storeThumbnails[2] }}
                        style={styles.stickerImg}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View
                        style={[
                          styles.stickerFallback,
                          { backgroundColor: isDark ? "#1c1917" : "#fff7ed" },
                        ]}
                      >
                        <Ionicons
                          name="bag-handle"
                          size={22}
                          color={PRIMARY}
                        />
                      </View>
                    )}
                  </View>
                </View>

                {/* Right: Title, Subtitle, and Native Action Button with Text & Arrow */}
                <View style={styles.storeBannerContent}>
                  <Text
                    style={[
                      styles.storeBannerTitle,
                      { color: isDark ? "#ffffff" : "#0f172a" },
                    ]}
                    numberOfLines={1}
                  >
                    Fellowship Store
                  </Text>
                  <Text
                    style={[
                      styles.storeBannerSubtitle,
                      { color: isDark ? "#a1a1aa" : "#64748b" },
                    ]}
                    numberOfLines={1}
                  >
                    Official Hoodies, T-Shirts & Stickers
                  </Text>
                  <View
                    style={[
                      styles.storeActionBtn,
                      {
                        backgroundColor: isDark
                          ? "rgba(255, 103, 25, 0.14)"
                          : "rgba(255, 103, 25, 0.1)",
                      },
                    ]}
                  >
                    <Text style={[styles.storeActionText, { color: PRIMARY }]}>
                      Visit Store
                    </Text>
                    <Ionicons name="arrow-forward" size={13} color={PRIMARY} />
                  </View>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? "#52525b" : "#94a3b8"}
                />
              </Pressable>
            </View>
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

const styles = StyleSheet.create({
  storeBannerWrapper: {
    marginHorizontal: 16,
    marginBottom: 40,
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  storeBannerCard: {
    minHeight: 116,
    paddingVertical: 18,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stickersContainer: {
    width: 90,
    height: 78,
    position: "relative",
    justifyContent: "center",
  },
  stickerBadge: {
    position: "absolute",
    borderRadius: 14,
    borderWidth: 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 4,
  },
  sticker1: {
    left: 2,
    top: 6,
    width: 48,
    height: 48,
    transform: [{ rotate: "-14deg" }],
    zIndex: 1,
  },
  sticker2: {
    left: 42,
    top: 4,
    width: 46,
    height: 46,
    transform: [{ rotate: "14deg" }],
    zIndex: 2,
  },
  sticker3: {
    left: 20,
    top: 26,
    width: 52,
    height: 52,
    transform: [{ rotate: "-2deg" }],
    zIndex: 3,
    borderWidth: 2.5,
    shadowColor: PRIMARY,
    shadowOpacity: 0.28,
    elevation: 6,
  },
  stickerImg: {
    width: "100%",
    height: "100%",
  },
  stickerFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  storeBannerContent: {
    flex: 1,
    justifyContent: "center",
  },
  storeBannerTitle: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  storeBannerSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
    marginBottom: 8,
    lineHeight: 17,
  },
  storeActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    gap: 5,
  },
  storeActionText: {
    fontSize: 12.5,
    fontWeight: "700",
  },
});

export default Gifts;
