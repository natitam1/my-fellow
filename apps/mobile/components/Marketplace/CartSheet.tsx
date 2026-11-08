import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants/colors";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { useUserStore } from "@/stores/user.store";
import { getProductImage, getProductPrice, Order } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CartSheetProps {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const CartSheet = ({ visible, onClose, isDark }: CartSheetProps) => {
  const router = useRouter();
  const { user } = useUserStore();

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    placeOrder,
    placingOrder,
  } = useMarketplaceStore();

  // "cart" (step 1) -> "confirm" (step 2) -> "success" (step 3)
  const [step, setStep] = useState<"cart" | "confirm" | "success">("cart");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = getCartTotal();

  const handleDismiss = () => {
    setStep("cart");
    setErrorMessage(null);
    onClose();
  };

  const handleProceedToConfirm = () => {
    if (!user) {
      handleDismiss();
      router.push("/(auth)/sign-in" as any);
      return;
    }
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    setStep("confirm");
  };

  const handleFinalPlaceOrder = async () => {
    try {
      setErrorMessage(null);
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }
      const order = await placeOrder();
      if (order) {
        setPlacedOrder(order);
        setStep("success");
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          ).catch(() => {});
        }
      }
    } catch (error: any) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error,
        ).catch(() => {});
      }
      setErrorMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Could not place order. Please check your connection and try again.",
      );
    }
  };

  const textColor = isDark ? "#FAFAFA" : "#0F172A";
  const subTextColor = isDark ? "#A1A1AA" : "#64748B";
  const cardBg = isDark ? "#27272A" : "#F8FAFC";
  const borderColor = isDark ? "#3F3F46" : "#E2E8F0";

  return (
    <AppBottomSheet
      visible={visible}
      onClose={handleDismiss}
      isDark={isDark}
      snapPoints={["half"]}
    >
      <View style={styles.sheetContainer}>
        {/* Step 1: Cart Items Summary */}
        {step === "cart" && (
          <View style={styles.contentWrap}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Ionicons name="cart" size={24} color={PRIMARY} />
                <Text style={[styles.headerTitle, { color: textColor }]}>
                  Your Cart
                </Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{cartItems.length}</Text>
                </View>
              </View>

              {cartItems.length > 0 && (
                <TouchableOpacity
                  onPress={clearCart}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.clearBtn}
                >
                  <Text style={styles.clearBtnText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>

            {cartItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyIconWrap,
                    { backgroundColor: isDark ? "#27272A" : "#FFF7ED" },
                  ]}
                >
                  <Ionicons name="cart-outline" size={48} color={PRIMARY} />
                </View>
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                  Your cart is empty
                </Text>
                <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
                  Explore exclusive fellowship apparel, stickers, and books to
                  support our campus fellowship.
                </Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cartItems}
                  keyExtractor={(item) => item.product.id}
                  showsVerticalScrollIndicator={false}
                  style={styles.cartList}
                  contentContainerStyle={{ paddingBottom: 16 }}
                  renderItem={({ item }) => {
                    const imageUri = getProductImage(item.product);
                    const price = getProductPrice(item.product);

                    return (
                      <View
                        style={[
                          styles.cartItemCard,
                          {
                            backgroundColor: cardBg,
                            borderColor,
                          },
                        ]}
                      >
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.itemThumb}
                          contentFit="cover"
                          transition={200}
                          cachePolicy="memory-disk"
                        />

                        <View style={styles.itemDetails}>
                          <Text
                            numberOfLines={1}
                            style={[styles.itemTitle, { color: textColor }]}
                          >
                            {item.product.title || item.product.name}
                          </Text>
                          <Text style={styles.itemUnitPrice}>
                            {(price * item.quantity).toFixed(2)} ETB
                          </Text>
                        </View>

                        <View style={styles.qtyControlRow}>
                          <TouchableOpacity
                            onPress={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity - 1,
                              )
                            }
                            style={[
                              styles.qtyStepBtn,
                              {
                                backgroundColor: isDark
                                  ? "#3F3F46"
                                  : "#E2E8F0",
                              },
                            ]}
                          >
                            <Ionicons
                              name="remove"
                              size={15}
                              color={textColor}
                            />
                          </TouchableOpacity>

                          <Text
                            style={[styles.qtyNumber, { color: textColor }]}
                          >
                            {item.quantity}
                          </Text>

                          <TouchableOpacity
                            onPress={() =>
                              updateQuantity(
                                item.product.id,
                                item.quantity + 1,
                              )
                            }
                            style={[
                              styles.qtyStepBtn,
                              { backgroundColor: PRIMARY },
                            ]}
                          >
                            <Ionicons name="add" size={15} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                          onPress={() => removeFromCart(item.product.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.trashBtn}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#EF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                />

                {/* Footer Totals & CTA */}
                <View style={styles.sheetFooter}>
                  <View style={styles.totalRow}>
                    <Text
                      style={[styles.totalLabel, { color: subTextColor }]}
                    >
                      Order Total
                    </Text>
                    <Text style={[styles.totalAmount, { color: PRIMARY }]}>
                      {total.toFixed(2)} ETB
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={handleProceedToConfirm}
                    activeOpacity={0.8}
                    style={styles.primaryActionBtn}
                  >
                    <Text style={styles.primaryActionBtnText}>
                      Review & Confirm
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}

        {/* Step 2: Confirm Order Screen */}
        {step === "confirm" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.confirmScrollContent}
          >
            <View style={styles.stepBackRow}>
              <TouchableOpacity
                onPress={() => setStep("cart")}
                style={styles.backTouch}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="arrow-back" size={20} color={PRIMARY} />
                <Text style={styles.backTouchText}>Back to Cart</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.confirmHeaderTitle, { color: textColor }]}>
              Order Summary
            </Text>
            <Text style={[styles.confirmHeaderSubtitle, { color: subTextColor }]}>
              Please verify your contact info and order breakdown.
            </Text>

            {/* Buyer Info Card */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <Text
                style={[styles.summaryCardHeader, { color: subTextColor }]}
              >
                RECIPIENT CONTACT
              </Text>
              <View style={styles.summaryInfoRow}>
                <Ionicons name="person-outline" size={16} color={PRIMARY} />
                <Text style={[styles.summaryInfoText, { color: textColor }]}>
                  {user?.fullName || "Fellowship Member"}
                </Text>
              </View>
              <View style={styles.summaryInfoRow}>
                <Ionicons name="call-outline" size={16} color={PRIMARY} />
                <Text style={[styles.summaryInfoText, { color: textColor }]}>
                  {user?.phoneNumber || "Phone registered"}
                </Text>
              </View>
            </View>

            {/* Items Overview */}
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <Text
                style={[styles.summaryCardHeader, { color: subTextColor }]}
              >
                ITEMS ({cartItems.length})
              </Text>
              {cartItems.map((item) => {
                const itemPrice = getProductPrice(item.product);
                return (
                  <View key={item.product.id} style={styles.orderItemSummaryRow}>
                    <Text
                      numberOfLines={1}
                      style={[styles.orderItemName, { color: textColor }]}
                    >
                      {item.quantity}× {item.product.title || item.product.name}
                    </Text>
                    <Text
                      style={[styles.orderItemTotal, { color: textColor }]}
                    >
                      {(itemPrice * item.quantity).toFixed(2)} ETB
                    </Text>
                  </View>
                );
              })}

              <View
                style={[styles.summaryDivider, { backgroundColor: borderColor }]}
              />

              <View style={styles.orderItemSummaryRow}>
                <Text style={{ color: subTextColor, fontSize: 13.5 }}>
                  Delivery
                </Text>
                <Text
                  style={{ color: "#16A34A", fontSize: 13.5, fontWeight: "700" }}
                >
                  Free
                </Text>
              </View>

              <View style={styles.orderItemSummaryRow}>
                <Text
                  style={{ color: textColor, fontSize: 16, fontWeight: "800" }}
                >
                  Total Due
                </Text>
                <Text
                  style={{ color: PRIMARY, fontSize: 18, fontWeight: "900" }}
                >
                  {total.toFixed(2)} ETB
                </Text>
              </View>
            </View>

            {errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleFinalPlaceOrder}
              disabled={placingOrder}
              activeOpacity={0.8}
              style={[
                styles.primaryActionBtn,
                placingOrder && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.primaryActionBtnText}>
                {placingOrder ? "Placing Order..." : `Confirm & Place Order`}
              </Text>
              {!placingOrder && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#FFFFFF"
                />
              )}
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Step 3: Success Screen */}
        {step === "success" && (
          <View style={styles.successContainer}>
            <View style={styles.successIconBubble}>
              <Ionicons name="checkmark" size={44} color="#FFFFFF" />
            </View>

            <Text style={[styles.successTitle, { color: textColor }]}>
              Order Placed! 🎉
            </Text>

            <Text style={[styles.successSubtitle, { color: subTextColor }]}>
              Your fellowship merchandise order has been recorded. Our ministry
              team will have it prepared for you.
            </Text>

            {placedOrder && (
              <View
                style={[
                  styles.orderNumberPill,
                  { backgroundColor: cardBg, borderColor },
                ]}
              >
                <Text style={[styles.orderNumberLabel, { color: subTextColor }]}>
                  Order Reference:
                </Text>
                <Text style={[styles.orderNumberVal, { color: PRIMARY }]}>
                  #{placedOrder.id.slice(-8).toUpperCase()}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleDismiss}
              activeOpacity={0.8}
              style={[
                styles.primaryActionBtn,
                { marginTop: 24, width: "100%" },
              ]}
            >
              <Text style={styles.primaryActionBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </AppBottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    width: "100%",
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
  },
  contentWrap: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: PRIMARY,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearBtnText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 56,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  cartList: {
    maxHeight: 280,
    marginTop: 12,
  },
  cartItemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  itemUnitPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: PRIMARY,
  },
  qtyControlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 8,
  },
  qtyStepBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyNumber: {
    fontSize: 13,
    fontWeight: "800",
    minWidth: 18,
    textAlign: "center",
  },
  trashBtn: {
    padding: 6,
  },
  sheetFooter: {
    paddingTop: 14,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "900",
  },
  primaryActionBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 9999,
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryActionBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  confirmScrollContent: {
    paddingBottom: 24,
  },
  stepBackRow: {
    marginBottom: 12,
  },
  backTouch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backTouchText: {
    color: PRIMARY,
    fontSize: 13.5,
    fontWeight: "700",
  },
  confirmHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  confirmHeaderSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  summaryCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  summaryCardHeader: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  summaryInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  summaryInfoText: {
    fontSize: 13.5,
    fontWeight: "600",
  },
  orderItemSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  orderItemName: {
    fontSize: 13.5,
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  orderItemTotal: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 8,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorBannerText: {
    color: "#B91C1C",
    fontSize: 12.5,
    flex: 1,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  successIconBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13.5,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  orderNumberPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  orderNumberLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  orderNumberVal: {
    fontSize: 13,
    fontWeight: "800",
  },
});

export default CartSheet;
