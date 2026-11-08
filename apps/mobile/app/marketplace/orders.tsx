import { AppBottomSheet } from "@/components/AppBottomSheet";
import { ScreenHeader } from "@/components/ScreenHeader";
import OrderCard from "@/components/Marketplace/OrderCard";
import { OrderSkeletonList } from "@/components/Marketplace/OrderSkeleton";
import { InfoModal } from "@/components/Modals/InfoModal";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { useUserStore } from "@/stores/user.store";
import { Order, getProductImage, getProductPrice } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type OrderStatusType =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const STATUS_DETAILS: Record<
  OrderStatusType,
  { label: string; desc: string; icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  PENDING: {
    label: "Pending",
    desc: "Order placed, awaiting campus verification",
    icon: "time-outline",
    color: "#C2410C",
  },
  CONFIRMED: {
    label: "Confirmed",
    desc: "Order confirmed, ready for campus pickup preparation",
    icon: "checkmark-circle-outline",
    color: "#1D4ED8",
  },
  SHIPPED: {
    label: "Ready for Pickup",
    desc: "Available at 4 Kilo Fellowship Office for pickup",
    icon: "cube-outline",
    color: "#7C3AED",
  },
  DELIVERED: {
    label: "Completed",
    desc: "Handed over to member successfully",
    icon: "bag-check-outline",
    color: "#15803D",
  },
  CANCELLED: {
    label: "Cancelled",
    desc: "Order has been cancelled or refunded",
    icon: "close-circle-outline",
    color: "#B91C1C",
  },
};

const STATUS_OPTIONS: OrderStatusType[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUserStore();
  const isAdmin = useIsAdmin();

  const {
    orders,
    ordersLoading,
    fetchMyOrders,
    loadMoreOrders,
    adminOrders,
    adminOrdersLoading,
    fetchAdminOrders,
    updateOrderStatus,
  } = useMarketplaceStore();

  const [activeTab, setActiveTab] = useState<"my" | "admin">(
    isAdmin ? "admin" : "my",
  );
  const [selectedOrderForStatus, setSelectedOrderForStatus] =
    useState<Order | null>(null);
  const [selectedNewStatus, setSelectedNewStatus] =
    useState<OrderStatusType | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  useEffect(() => {
    if (user) {
      if (activeTab === "my") {
        fetchMyOrders(true);
      } else if (isAdmin) {
        fetchAdminOrders();
      }
    }
  }, [user, activeTab, isAdmin]);

  const handleOpenStatusSheet = (order: Order) => {
    setSelectedOrderForStatus(order);
    const normalized = (order.status || "PENDING").toUpperCase() as OrderStatusType;
    setSelectedNewStatus(STATUS_OPTIONS.includes(normalized) ? normalized : "PENDING");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handleCloseStatusSheet = () => {
    setSelectedOrderForStatus(null);
    setSelectedNewStatus(null);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrderForStatus || !selectedNewStatus) return;
    try {
      setStatusUpdating(true);
      await updateOrderStatus(selectedOrderForStatus.id, selectedNewStatus);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      }
      handleCloseStatusSheet();
      setInfoModal({
        visible: true,
        title: "Order Updated",
        message: `Order #${selectedOrderForStatus.id.slice(-6).toUpperCase()} status changed to ${STATUS_DETAILS[selectedNewStatus].label}.`,
        type: "success",
      });
    } catch {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
          () => {},
        );
      }
      setInfoModal({
        visible: true,
        title: "Update Failed",
        message: "Could not update order status. Please try again.",
        type: "error",
      });
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCallBuyer = (phone: string) => {
    const cleaned = phone.replace(/[^0-9+]/g, "");
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      setInfoModal({
        visible: true,
        title: "Calling Unavailable",
        message: `Could not launch dialer for ${phone}.`,
        type: "info",
      });
    });
  };

  const textColor = isDark ? "#FAFAFA" : "#0F172A";
  const subTextColor = isDark ? "#A1A1AA" : "#64748B";
  const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
  const itemBorder = isDark ? "#2C2C2E" : "#E2E8F0";

  // If user is not authenticated
  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: isDark ? "#121214" : "#F8FAFC" }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ScreenHeader title="Fellowship Orders" />
        <View style={styles.authPromptContainer}>
          <View
            style={[
              styles.authIconWrap,
              { backgroundColor: isDark ? "#27272A" : "#FFF7ED" },
            ]}
          >
            <Ionicons name="receipt-outline" size={56} color={PRIMARY} />
          </View>
          <Text style={[styles.authTitle, { color: textColor }]}>
            Sign In to View Orders
          </Text>
          <Text style={[styles.authDesc, { color: subTextColor }]}>
            Log in with your fellowship member account to track your orders and campus pickup notifications.
          </Text>
          <TouchableOpacity
            style={styles.signInBtn}
            onPress={() => router.push("/(auth)/sign-in" as any)}
            activeOpacity={0.85}
          >
            <Text style={styles.signInBtnText}>Sign In Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentList = activeTab === "admin" && isAdmin ? adminOrders : orders;
  const currentLoading =
    activeTab === "admin" && isAdmin ? adminOrdersLoading : ordersLoading;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121214" : "#F8FAFC" }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <ScreenHeader
        title={activeTab === "admin" && isAdmin ? "Fellowship Orders" : "My Orders"}
      />

      {/* Admin / Leader Tab Switcher */}
      {isAdmin && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              }
              setActiveTab("admin");
            }}
            style={[
              styles.tabBtn,
              activeTab === "admin"
                ? styles.tabBtnActive
                : isDark
                  ? styles.tabBtnDark
                  : styles.tabBtnLight,
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={15}
              color={activeTab === "admin" ? "#fff" : PRIMARY}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "admin"
                  ? styles.tabTextActive
                  : isDark
                    ? styles.tabTextDark
                    : styles.tabTextLight,
              ]}
            >
              Fellowship Orders ({adminOrders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              }
              setActiveTab("my");
            }}
            style={[
              styles.tabBtn,
              activeTab === "my"
                ? styles.tabBtnActive
                : isDark
                  ? styles.tabBtnDark
                  : styles.tabBtnLight,
            ]}
          >
            <Ionicons
              name="person"
              size={14}
              color={activeTab === "my" ? "#fff" : subTextColor}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "my"
                  ? styles.tabTextActive
                  : isDark
                    ? styles.tabTextDark
                    : styles.tabTextLight,
              ]}
            >
              My Orders ({orders.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List or Minimalistic Skeleton */}
      {currentLoading && currentList.length === 0 ? (
        <OrderSkeletonList isDark={isDark} count={4} />
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: bottom + 32,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 4 }}>
              <OrderCard
                order={item}
                isDark={isDark}
                onPress={
                  isAdmin && activeTab === "admin"
                    ? () => handleOpenStatusSheet(item)
                    : undefined
                }
              />
              {isAdmin && activeTab === "admin" && (
                <View style={styles.adminActionRow}>
                  <TouchableOpacity
                    onPress={() => handleOpenStatusSheet(item)}
                    style={styles.statusChangeBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="create-outline" size={14} color={PRIMARY} />
                    <Text style={styles.statusChangeBtnText}>
                      Update Status: {(item.status || "PENDING").toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          onEndReached={activeTab === "my" ? loadMoreOrders : undefined}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconWrap,
                  { backgroundColor: isDark ? "#27272A" : "#F1F5F9" },
                ]}
              >
                <Ionicons
                  name="receipt-outline"
                  size={56}
                  color={isDark ? "#71717A" : "#94A3B8"}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>
                {activeTab === "admin"
                  ? "No fellowship orders yet"
                  : "You haven't placed any orders"}
              </Text>
              <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
                {activeTab === "admin"
                  ? "When fellowship members purchase merchandise from the store, their orders will appear here for tracking."
                  : "Explore the fellowship store to find official hoodies, t-shirts, and handcrafted soap that support fellowship ministry."}
              </Text>
              {activeTab === "my" && (
                <TouchableOpacity
                  style={styles.shopNowBtn}
                  onPress={() => router.push("/marketplace" as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.shopNowBtnText}>Browse Store</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={currentLoading}
              onRefresh={() => {
                if (activeTab === "admin" && isAdmin) {
                  fetchAdminOrders();
                } else {
                  fetchMyOrders(true);
                }
              }}
              colors={[PRIMARY]}
              tintColor={PRIMARY}
            />
          }
        />
      )}

      {/* Native AppBottomSheet for Updating Order Status */}
      <AppBottomSheet
        visible={Boolean(selectedOrderForStatus)}
        onClose={handleCloseStatusSheet}
        isDark={isDark}
        snapPoints={["half", "full"]}
      >
        {selectedOrderForStatus && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.sheetScroll,
              { paddingBottom: Math.max(bottom + 20, 32) },
            ]}
          >
            {/* Sheet Header */}
            <View style={styles.sheetHeaderRow}>
              <View>
                <Text style={[styles.sheetTitle, { color: textColor }]}>
                  Order #{selectedOrderForStatus.id.slice(-6).toUpperCase()}
                </Text>
                <Text style={[styles.sheetSubtitle, { color: subTextColor }]}>
                  Placed on{" "}
                  {selectedOrderForStatus.createdAt
                    ? new Date(selectedOrderForStatus.createdAt).toLocaleDateString(
                        undefined,
                        { month: "short", day: "numeric", year: "numeric" },
                      )
                    : "Recently"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCloseStatusSheet}
                style={[styles.sheetCloseBtn, { backgroundColor: isDark ? "#27272A" : "#F1F5F9" }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={subTextColor} />
              </TouchableOpacity>
            </View>

            {/* Buyer Details (if available) */}
            {selectedOrderForStatus.buyer && (
              <View
                style={[
                  styles.buyerCard,
                  { backgroundColor: cardBg, borderColor: itemBorder },
                ]}
              >
                <View style={styles.buyerHeader}>
                  <View style={styles.buyerLeft}>
                    <Ionicons name="person-circle" size={36} color={PRIMARY} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={[styles.buyerName, { color: textColor }]}>
                        {selectedOrderForStatus.buyer.fullName || "Fellowship Member"}
                      </Text>
                      {selectedOrderForStatus.buyer.department && (
                        <Text style={[styles.buyerMeta, { color: subTextColor }]}>
                          {selectedOrderForStatus.buyer.department}{" "}
                          {selectedOrderForStatus.buyer.yearOfStudy
                            ? `• ${selectedOrderForStatus.buyer.yearOfStudy}`
                            : ""}
                        </Text>
                      )}
                    </View>
                  </View>

                  {selectedOrderForStatus.buyer.phoneNumber && (
                    <TouchableOpacity
                      onPress={() =>
                        handleCallBuyer(selectedOrderForStatus.buyer!.phoneNumber!)
                      }
                      style={styles.callBuyerBtn}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="call" size={14} color="#FFFFFF" />
                      <Text style={styles.callBuyerBtnText}>Call</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {selectedOrderForStatus.buyer.phoneNumber && (
                  <Text style={[styles.buyerPhoneText, { color: subTextColor }]}>
                    Phone: {selectedOrderForStatus.buyer.phoneNumber}
                  </Text>
                )}
              </View>
            )}

            {/* Order Items Summary */}
            <View style={styles.sheetSection}>
              <Text style={[styles.sheetSectionTitle, { color: textColor }]}>
                Items Ordered ({selectedOrderForStatus.items?.length || 0})
              </Text>
              {selectedOrderForStatus.items?.map((item, idx) => {
                const img = item.product ? getProductImage(item.product) : null;
                const unitPrice = item.unitPrice
                  ? typeof item.unitPrice === "string"
                    ? parseFloat(item.unitPrice)
                    : item.unitPrice
                  : 0;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.orderItemRow,
                      { borderColor: itemBorder, backgroundColor: cardBg },
                    ]}
                  >
                    {img && (
                      <ExpoImage
                        source={{ uri: img }}
                        style={styles.orderItemThumb}
                        contentFit="cover"
                        transition={200}
                      />
                    )}
                    <View style={styles.orderItemInfo}>
                      <Text
                        numberOfLines={1}
                        style={[styles.orderItemName, { color: textColor }]}
                      >
                        {item.product?.title || item.product?.name || `Product #${idx + 1}`}
                      </Text>
                      <Text style={[styles.orderItemQty, { color: subTextColor }]}>
                        Qty: {item.quantity} × {unitPrice.toFixed(2)} ETB
                      </Text>
                    </View>
                    <Text style={styles.orderItemTotal}>
                      {(unitPrice * item.quantity).toFixed(2)} ETB
                    </Text>
                  </View>
                );
              })}

              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: subTextColor }]}>
                  Order Total
                </Text>
                <Text style={styles.totalValue}>
                  {(
                    typeof selectedOrderForStatus.totalAmount === "string"
                      ? parseFloat(selectedOrderForStatus.totalAmount)
                      : selectedOrderForStatus.totalAmount || 0
                  ).toFixed(2)}{" "}
                  ETB
                </Text>
              </View>
            </View>

            {/* Status Selector */}
            <View style={styles.sheetSection}>
              <Text style={[styles.sheetSectionTitle, { color: textColor }]}>
                Change Order Status
              </Text>
              <View style={styles.statusOptionsList}>
                {STATUS_OPTIONS.map((st) => {
                  const details = STATUS_DETAILS[st];
                  const isSelected = selectedNewStatus === st;

                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                            () => {},
                          );
                        }
                        setSelectedNewStatus(st);
                      }}
                      disabled={statusUpdating}
                      style={[
                        styles.statusCard,
                        {
                          backgroundColor: cardBg,
                          borderColor: isSelected ? PRIMARY : itemBorder,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                      activeOpacity={0.8}
                    >
                      <View style={styles.statusCardLeft}>
                        <View
                          style={[
                            styles.statusIconWrap,
                            { backgroundColor: `${details.color}18` },
                          ]}
                        >
                          <Ionicons
                            name={details.icon}
                            size={18}
                            color={details.color}
                          />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text
                            style={[
                              styles.statusCardLabel,
                              { color: isSelected ? PRIMARY : textColor },
                            ]}
                          >
                            {details.label}
                          </Text>
                          <Text
                            style={[styles.statusCardDesc, { color: subTextColor }]}
                          >
                            {details.desc}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && { borderColor: PRIMARY, backgroundColor: PRIMARY },
                        ]}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveStatus}
              disabled={statusUpdating}
              style={[
                styles.saveStatusBtn,
                statusUpdating && { opacity: 0.7 },
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.saveStatusBtnText}>
                {statusUpdating ? "Updating Status..." : "Save Status Changes"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </AppBottomSheet>

      <InfoModal
        visible={infoModal.visible}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    paddingVertical: 12,
  },
  tabBtn: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
  },
  tabBtnDark: {
    backgroundColor: "#1C1C1E",
    borderColor: "#2C2C2E",
  },
  tabBtnLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  tabBtnActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabTextDark: {
    color: "#94A3B8",
  },
  tabTextLight: {
    color: "#64748B",
  },
  adminActionRow: {
    marginTop: -8,
    marginBottom: 8,
    paddingHorizontal: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusChangeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
  },
  statusChangeBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: PRIMARY,
  },
  authPromptContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  authIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  authDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 24,
  },
  signInBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  signInBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 24,
  },
  shopNowBtn: {
    backgroundColor: PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  shopNowBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  // Sheet Styles
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sheetHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buyerCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 18,
  },
  buyerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buyerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  buyerName: {
    fontSize: 15,
    fontWeight: "700",
  },
  buyerMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  callBuyerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#16A34A",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  callBuyerBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  buyerPhoneText: {
    fontSize: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(150, 150, 150, 0.2)",
  },
  sheetSection: {
    marginBottom: 18,
  },
  sheetSectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  orderItemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  orderItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: "700",
  },
  orderItemQty: {
    fontSize: 12,
    marginTop: 2,
  },
  orderItemTotal: {
    fontSize: 13,
    fontWeight: "800",
    color: PRIMARY,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 17,
    fontWeight: "900",
    color: PRIMARY,
  },
  statusOptionsList: {
    gap: 10,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
  },
  statusCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  statusIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCardLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  statusCardDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
  },
  saveStatusBtn: {
    backgroundColor: PRIMARY,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  saveStatusBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});
