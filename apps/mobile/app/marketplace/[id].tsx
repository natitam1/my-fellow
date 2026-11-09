import CartSheet from "@/components/Marketplace/CartSheet";
import ImageGallery from "@/components/Marketplace/ImageGallery";
import { InfoModal } from "@/components/Modals/InfoModal";
import { NativeBackButton } from "@/components/ui/NativeBackButton";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useProductDetailQuery } from "@/queries/marketplace.queries";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { useUserStore } from "@/stores/user.store";
import {
  APPAREL_SIZES,
  ApparelSize,
  getProductImages,
  getProductPrice,
  isApparelProduct,
} from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Constants ────────────────────────────────────────────────────────────────
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/500";

// Minimalistic Product Detail Skeleton
const ProductDetailSkeleton = ({ isDark }: { isDark: boolean }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
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

  const bg = isDark ? "#27272a" : "#e2e8f0";

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#121214" : "#FFFFFF" }}>
      <Animated.View
        style={[{ width: "100%", height: 340, backgroundColor: bg }, animatedStyle]}
      />
      <View style={{ padding: 24, flex: 1 }}>
        <Animated.View
          style={[
            { width: 80, height: 22, borderRadius: 6, backgroundColor: bg, marginBottom: 12 },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            { width: "75%", height: 26, borderRadius: 8, backgroundColor: bg, marginBottom: 16 },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            { width: 130, height: 24, borderRadius: 6, backgroundColor: bg, marginBottom: 24 },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            { width: "100%", height: 14, borderRadius: 4, backgroundColor: bg, marginBottom: 8 },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            { width: "90%", height: 14, borderRadius: 4, backgroundColor: bg, marginBottom: 8 },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            { width: "65%", height: 14, borderRadius: 4, backgroundColor: bg, marginBottom: 32 },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProductDetailScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const isAdmin = useIsAdmin();

  const { user } = useUserStore();
  const {
    product,
    isLoading: loading,
    errorMessage: error,
    refetch: refetchProduct,
  } = useProductDetailQuery(id);
  const {
    addToCart,
    cartVisible,
    setCartVisible,
    getCartCount,
  } = useMarketplaceStore();

  const cartCount = getCartCount();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<ApparelSize>("L");
  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  // Derived values
  const images = product ? getProductImages(product) : [PLACEHOLDER_IMAGE];
  const price = product ? getProductPrice(product) : 0;
  const displayName = product?.name || product?.title || "Product";
  const isOutOfStock = product?.stock === 0;
  const isApparel = isApparelProduct(product);
  const chosenSize = isApparel ? selectedSize : undefined;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!product) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    addToCart(product, quantity, chosenSize);
    setInfoModal({
      visible: true,
      title: "Added to Cart",
      message: `${quantity}× ${displayName}${chosenSize ? ` (Size ${chosenSize})` : ""} added to your cart.`,
      type: "success",
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    addToCart(product, quantity, chosenSize);
    setCartVisible(true);
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading && !product) {
    return <ProductDetailSkeleton isDark={isDark} />;
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <View
        style={[
          styles.centered,
          { backgroundColor: isDark ? "#1A1A1B" : "#fff" },
        ]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Ionicons name="alert-circle-outline" size={64} color="#ff6719" />
        <Text
          style={[styles.errorTitle, { color: isDark ? "#fff" : "#18181b" }]}
        >
          {error || "Product not found"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.errorButton}
          activeOpacity={0.9}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1A1A1B" : "#fff" }}>
      <StatusBar style="light" />

      {/* ── Floating Header ────────────────────────────────────────────── */}
      <HeaderBar
        isDark={isDark}
        top={top}
        onBack={() => router.back()}
        isAdmin={isAdmin}
        onEdit={() => router.push(`/marketplace/manage?id=${id}`)}
        cartCount={cartCount}
        onCart={() => setCartVisible(true)}
        onShare={() => {
          setInfoModal({
            visible: true,
            title: "Share",
            message: "Share feature coming soon!",
            type: "info",
          });
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180 }}
        bounces={true}
      >
        {/* ── Image Gallery ─────────────────────────────────────────────── */}
        <ImageGallery images={images} isDark={isDark} />

        {/* ── Product Info ──────────────────────────────────────────────── */}
        <View
          style={[
            styles.contentContainer,
            { backgroundColor: isDark ? "#1A1A1B" : "#fff" },
          ]}
        >
          {/* Category badge */}
          {product.category && (
            <View
              style={[
                styles.categoryBadge,
                {
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isDark ? "#a1a1aa" : "#71717a" },
                ]}
              >
                {product.category.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Name */}
          <Text
            style={[styles.productName, { color: isDark ? "#fff" : "#09090b" }]}
          >
            {displayName}
          </Text>

          {/* Price & Stock Row */}
          <View style={styles.priceRow}>
            <Text
              style={[
                styles.productPrice,
                { color: isDark ? "#fff" : "#09090b" },
              ]}
            >
              {price.toFixed(2)} ETB
            </Text>
            {product.stock != null && (
              <View
                style={[
                  styles.stockBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.04)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.stockDot,
                    {
                      backgroundColor: isOutOfStock ? "#ef4444" : "#22c55e",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.stockText,
                    {
                      color: isOutOfStock
                        ? "#ef4444"
                        : isDark
                          ? "#a1a1aa"
                          : "#52525b",
                    },
                  ]}
                >
                  {isOutOfStock ? "Out of stock" : `${product.stock} in stock`}
                </Text>
              </View>
            )}
          </View>

          {/* New Badge */}
          {product.isNew && (
            <View style={styles.newBadge}>
              <Text
                style={[
                  styles.newBadgeText,
                  { color: isDark ? "#71717a" : "#a1a1aa" },
                ]}
              >
                New Arrival
              </Text>
            </View>
          )}

          {/* Divider */}
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
            ]}
          />

          {/* Description */}
          {(product.description || product.shortDescription) && (
            <View style={styles.descriptionSection}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? "#e4e4e7" : "#27272a" },
                ]}
              >
                About this product
              </Text>
              <Text
                style={[
                  styles.descriptionText,
                  { color: isDark ? "#a1a1aa" : "#52525b" },
                ]}
              >
                {product.description || product.shortDescription}
              </Text>
            </View>
          )}

          {/* Apparel Size Selector */}
          {isApparel && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: isDark ? "#e4e4e7" : "#27272a" },
                ]}
              >
                Select Size
              </Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                {APPAREL_SIZES.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <TouchableOpacity
                      key={size}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          Haptics.selectionAsync().catch(() => {});
                        }
                        setSelectedSize(size);
                      }}
                      activeOpacity={0.8}
                      style={{
                        flex: 1,
                        height: 44,
                        borderRadius: 14,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isSelected
                          ? "#ff6719"
                          : isDark
                            ? "#27272a"
                            : "#f4f4f5",
                        borderWidth: 1,
                        borderColor: isSelected
                          ? "#ff6719"
                          : isDark
                            ? "#3f3f46"
                            : "#e4e4e7",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: isSelected
                            ? "#ffffff"
                            : isDark
                              ? "#fafafa"
                              : "#18181b",
                        }}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Quantity Selector — inline */}
          <View style={styles.quantitySection}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#e4e4e7" : "#27272a" },
              ]}
            >
              Quantity
            </Text>
            <View
              style={[
                styles.quantityWrapper,
                {
                  backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                  borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                },
              ]}
            >
              <TouchableOpacity
                onPress={decrementQuantity}
                style={styles.qtyBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={isDark ? "#fff" : "#18181b"}
                />
              </TouchableOpacity>
              <Text
                style={[
                  styles.qtyValue,
                  { color: isDark ? "#fff" : "#18181b" },
                ]}
              >
                {quantity}
              </Text>
              <TouchableOpacity
                onPress={incrementQuantity}
                style={styles.qtyBtn}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={isDark ? "#fff" : "#18181b"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom Action Bar ─────────────────────────────────────────────── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark ? "#1A1A1B" : "#fff",
            borderTopColor: isDark ? "#27272a" : "#f4f4f5",
            paddingBottom: bottom > 0 ? bottom + 4 : 20,
          },
        ]}
      >
        {/* Add to Cart */}
        <TouchableOpacity
          style={[
            styles.addToCartBtn,
            isOutOfStock && { opacity: 0.5 },
            { borderColor: isDark ? "#3f3f46" : "#e4e4e7" },
          ]}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          activeOpacity={0.9}
        >
          <Ionicons
            name="cart-outline"
            size={22}
            color={isDark ? "#fff" : "#18181b"}
          />
        </TouchableOpacity>

        {/* Buy Now / Place Order */}
        <TouchableOpacity
          style={[
            styles.buyNowBtn,
            isOutOfStock && { backgroundColor: "#71717a" },
          ]}
          onPress={handleBuyNow}
          disabled={isOutOfStock}
          activeOpacity={0.9}
        >
          <Text style={styles.buyNowText}>
            {isOutOfStock
              ? "Out of Stock"
              : `Buy Now · ${(price * quantity).toFixed(2)} ETB`}
          </Text>
          {!isOutOfStock && (
            <Ionicons name="arrow-forward-circle" size={22} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      <CartSheet
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        isDark={isDark}
      />

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal((prev) => ({ ...prev, visible: false }))}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
        isDark={isDark}
      />
    </View>
  );
}

// ─── Header Component ─────────────────────────────────────────────────────────
/** Floating header bar matching event details screen style. */
const HeaderBar = ({
  isDark,
  top,
  onBack,
  onShare,
  isAdmin,
  onEdit,
  cartCount = 0,
  onCart,
}: {
  isDark: boolean;
  top: number;
  onBack: () => void;
  onShare: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  cartCount?: number;
  onCart?: () => void;
}) => (
  <View style={[styles.headerContainer, { top: top + 10 }]}>
    <NativeBackButton variant="glass" size={40} onPress={onBack} />
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {isAdmin && onEdit && (
        <TouchableOpacity
          onPress={onEdit}
          activeOpacity={0.8}
          style={styles.headerButton}
        >
          <Ionicons name="pencil" size={20} color="#ff6719" />
        </TouchableOpacity>
      )}
      {onCart && (
        <TouchableOpacity
          onPress={onCart}
          activeOpacity={0.8}
          style={[styles.headerButton, { position: "relative" }]}
        >
          <Ionicons name="cart-outline" size={22} color="#fff" />
          {cartCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                backgroundColor: "#ff6719",
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 3,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>
                {cartCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={onShare}
        activeOpacity={0.8}
        style={styles.headerButton}
      >
        <Ionicons name="share-social-outline" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // States
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 16,
    textAlign: "center",
  },
  errorButton: {
    marginTop: 16,
    backgroundColor: "#ff6719",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  errorButtonText: {
    color: "#fff",
    fontWeight: "800",
  },

  // Header
  headerContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  // Content
  contentContainer: {
    marginTop: -24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 14,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  productName: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  stockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "600",
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    marginTop: 20,
    marginBottom: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 26,
    letterSpacing: 0.1,
  },

  // Quantity
  quantitySection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  quantityWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  qtyBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyValue: {
    fontSize: 17,
    fontWeight: "900",
    minWidth: 30,
    textAlign: "center",
  },

  // Bottom bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  addToCartBtn: {
    width: 54,
    height: 54,
    borderRadius: 9999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNowBtn: {
    flex: 1,
    height: 54,
    backgroundColor: "#ff6719",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9999,
    gap: 8,
  },
  buyNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
