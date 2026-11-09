import CartBadge from "@/components/Marketplace/CartBadge";
import CartSheet from "@/components/Marketplace/CartSheet";
import ProductCard from "@/components/Marketplace/ProductCard";
import ProductSkeleton from "@/components/Marketplace/ProductSkeleton";
import { InfoModal } from "@/components/Modals/InfoModal";
import { ProductBottomSheet } from "@/components/Modals/ProductBottomSheet";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useProductsInfiniteQuery } from "@/queries/marketplace.queries";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { Product } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Route, TabBar, TabView } from "react-native-tab-view";

const STORE_ROUTES: { key: string; title: string }[] = [
  { key: "All", title: "All" },
  { key: "t-shirt", title: "T-Shirts" },
  { key: "hoodie", title: "Hoodies" },
  { key: "soap", title: "Soap" },
];

const MAIN_CATEGORIES = [
  "t-shirt",
  "t-shirts",
  "tshirt",
  "tshirts",
  "shirt",
  "hoodie",
  "hoodies",
  "hoddy",
  "sweatshirt",
  "soap",
  "soaps",
];

interface ProductGridSceneProps {
  categoryKey: string;
  categoryTitle: string;
  products: Product[];
  loading: boolean;
  refreshing: boolean;
  isFetchingNextPage: boolean;
  isError: boolean;
  errorMessage: string | null;
  hasMore: boolean;
  isDark: boolean;
  bottomInset: number;
  onRefresh: () => void;
  onLoadMore: () => void;
  onProductPress: (product: Product) => void;
  onBuyPress: (product: Product) => void;
}

const ProductGridScene = React.memo(function ProductGridScene({
  categoryKey,
  categoryTitle,
  products,
  loading,
  refreshing,
  isFetchingNextPage,
  isError,
  errorMessage,
  hasMore,
  isDark,
  bottomInset,
  onRefresh,
  onLoadMore,
  onProductPress,
  onBuyPress,
}: ProductGridSceneProps) {
  const categoryProducts = useMemo(() => {
    const seen = new Set<string>();
    const uniqueProducts = products.filter((p) => {
      if (!p) return false;
      const key = String(p.id || (p as any)._id || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (categoryKey === "All") return uniqueProducts;

    return uniqueProducts.filter((p) => {
      if (categoryKey === "new") {
        if (p.isNew) return true;
        if (!p.createdAt) return false;
        const createdDate = new Date(p.createdAt);
        const now = new Date();
        const diffDays = Math.ceil(
          Math.abs(now.getTime() - createdDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return diffDays <= 7;
      }

      const cat = p.category?.toLowerCase().trim() || "";
      if (categoryKey === "others") {
        return !MAIN_CATEGORIES.includes(cat);
      }

      if (categoryKey === "t-shirt") {
        return (
          cat === "t-shirt" ||
          cat === "t-shirts" ||
          cat === "tshirt" ||
          cat === "tshirts" ||
          cat === "shirt"
        );
      }

      if (categoryKey === "hoodie") {
        return (
          cat === "hoodie" ||
          cat === "hoodies" ||
          cat === "hoddy" ||
          cat === "sweatshirt"
        );
      }

      if (categoryKey === "soap") {
        return cat === "soap" || cat === "soaps" || cat === "personal-care";
      }

      return cat === categoryKey.toLowerCase();
    });
  }, [products, categoryKey]);

  if (loading && products.length === 0) {
    return (
      <View style={{ flex: 1, paddingTop: 16 }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: 8,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ width: "50%", paddingHorizontal: 4 }}>
              <ProductSkeleton isDark={isDark} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const renderFooter = () => {
    if (!hasMore || !isFetchingNextPage) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={PRIMARY} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (isError) {
      return (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 80,
            paddingHorizontal: 32,
          }}
        >
          <Ionicons
            name="cloud-offline-outline"
            size={56}
            color={isDark ? "#ef4444" : "#dc2626"}
          />
          <Text
            style={{
              marginTop: 14,
              fontSize: 16,
              fontWeight: "700",
              color: isDark ? "#f4f4f5" : "#18181b",
            }}
          >
            Could not load products
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 13,
              color: isDark ? "#a1a1aa" : "#71717a",
              textAlign: "center",
              paddingHorizontal: 16,
            }}
          >
            {errorMessage || "Please check your connection and try again."}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
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
      );
    }
    return (
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 80,
          paddingHorizontal: 32,
        }}
      >
        <Ionicons
          name="storefront-outline"
          size={64}
          color={isDark ? "#3f3f46" : "#d4d4d8"}
        />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            fontWeight: "700",
            color: isDark ? "#71717a" : "#a1a1aa",
          }}
        >
          {categoryKey === "All"
            ? "No products available"
            : `No ${categoryTitle.toLowerCase()} available`}
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontSize: 13,
            color: isDark ? "#52525b" : "#a1a1aa",
            textAlign: "center",
            paddingHorizontal: 20,
          }}
        >
          Check back later for new items in our fellowship collection.
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={categoryProducts}
      keyExtractor={(item, index) =>
        String(item.id || (item as any)._id || `product-${index}`)
      }
      numColumns={2}
      contentContainerStyle={{
        paddingHorizontal: 8,
        paddingBottom: bottomInset + 110,
        paddingTop: 8,
        flexGrow: 1,
      }}
      columnWrapperStyle={{ paddingHorizontal: 4 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={{ width: "50%", paddingHorizontal: 4 }}>
          <ProductCard
            product={item}
            isDark={isDark}
            onPress={() => onProductPress(item)}
            onBuy={() => onBuyPress(item)}
          />
        </View>
      )}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[PRIMARY]}
          tintColor={PRIMARY}
        />
      }
    />
  );
});

export default function MarketplaceScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { bottom } = useSafeAreaInsets();
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const cartCount = useMarketplaceStore((s) => s.getCartCount());

  const [cartVisible, setCartVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  const {
    addToCart,
    selectedCategory,
    setSelectedCategory,
  } = useMarketplaceStore();

  const {
    products,
    isLoading: loading,
    isBackgroundRefetching: refreshing,
    isFetchingNextPage,
    isError,
    errorMessage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useProductsInfiniteQuery("All", 20);

  const hasMore = Boolean(hasNextPage);

  const initialIndex = useMemo(() => {
    const idx = STORE_ROUTES.findIndex(
      (r) => r.key.toLowerCase() === selectedCategory?.toLowerCase(),
    );
    return idx >= 0 ? idx : 0;
  }, [selectedCategory]);

  const [tabIndex, setTabIndex] = useState(initialIndex);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleOpenProductSheet = useCallback((product: Product) => {
    setSelectedProduct(product);
    setBottomSheetVisible(true);
  }, []);

  const handleAddToCart = useCallback(
    (product: Product, quantity: number = 1) => {
      addToCart(product, quantity);
      const displayName = product.name || product.title || "Product";
      setInfoModal({
        visible: true,
        title: "Added to Cart",
        message: `${displayName} has been added to your cart.`,
        type: "success",
      });
    },
    [addToCart],
  );

  const handleIndexChange = useCallback(
    (index: number) => {
      if (Platform.OS !== "web") {
        Haptics.selectionAsync().catch(() => {});
      }
      setTabIndex(index);
      setSelectedCategory(STORE_ROUTES[index].key);
    },
    [setSelectedCategory],
  );

  const handleProductPress = useCallback(
    (item: Product) => {
      router.push(`/marketplace/${item.id}` as any);
    },
    [router],
  );

  const renderScene = useCallback(
    ({ route }: { route: Route }) => {
      return (
        <ProductGridScene
          categoryKey={route.key}
          categoryTitle={route.title || route.key}
          products={products}
          loading={loading}
          refreshing={refreshing}
          isFetchingNextPage={isFetchingNextPage}
          isError={isError}
          errorMessage={errorMessage}
          hasMore={hasMore}
          isDark={isDark}
          bottomInset={bottom}
          onRefresh={handleRefresh}
          onLoadMore={handleLoadMore}
          onProductPress={handleProductPress}
          onBuyPress={handleOpenProductSheet}
        />
      );
    },
    [
      products,
      loading,
      refreshing,
      isFetchingNextPage,
      isError,
      errorMessage,
      hasMore,
      isDark,
      bottom,
      handleRefresh,
      handleLoadMore,
      handleProductPress,
      handleOpenProductSheet,
    ],
  );

  const renderTabBar = useCallback(
    (tabBarProps: any) => (
      <TabBar
        {...tabBarProps}
        scrollEnabled
        bounces
        tabStyle={styles.tabBarItem}
        indicatorStyle={{
          backgroundColor: PRIMARY,
          height: 3,
          borderRadius: 1.5,
        }}
        style={[
          styles.tabBarStyle,
          {
            backgroundColor: isDark ? "#0A0A0A" : "#ffffff",
            borderBottomColor: isDark ? "#1f2937" : "#e5e7eb",
          },
        ]}
        activeColor={PRIMARY}
        inactiveColor={isDark ? "#71767b" : "#71717a"}
        pressColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}
        renderLabel={({
          route,
          focused,
          color,
        }: {
          route: Route;
          focused: boolean;
          color: string;
        }) => (
          <View style={styles.tabLabelRow}>
            <Text
              style={[
                styles.tabLabelText,
                {
                  color: focused ? PRIMARY : color,
                  fontWeight: focused ? "700" : "600",
                },
              ]}
            >
              {route.title}
            </Text>
            {route.key === "new" && (
              <View
                style={[styles.tabNewDot, { backgroundColor: PRIMARY }]}
              />
            )}
          </View>
        )}
      />
    ),
    [isDark],
  );

  const windowWidth = Dimensions.get("window").width;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#0A0A0A" : "#f8fafc",
      }}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Screen Header */}
      <ScreenHeader
        title="Fellowship Store"
        borderBottom={false}
        rightAction={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <TouchableOpacity
              onPress={() => router.push("/marketplace/orders" as any)}
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="View Orders"
            >
              <Ionicons
                name="receipt-outline"
                size={22}
                color={isDark ? "white" : "#0f172a"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCartVisible(true)}
              activeOpacity={0.8}
              className="w-10 h-10 rounded-full items-center justify-center relative"
              accessibilityRole="button"
              accessibilityLabel="View Shopping Cart"
            >
              <Ionicons
                name="cart-outline"
                size={22}
                color={isDark ? "white" : "#0f172a"}
              />
              {cartCount > 0 && (
                <View
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
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
                      color: "#ffffff",
                      fontSize: 10,
                      fontWeight: "800",
                    }}
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        }
      />

      {/* Subtitle / Fellowship Ministry Mission Note */}
      <View
        style={{
          paddingHorizontal: 18,
          paddingTop: 4,
          paddingBottom: 10,
          backgroundColor: isDark ? "#0A0A0A" : "#ffffff",
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            fontSize: 13,
            lineHeight: 18,
            color: isDark ? "#9ca3af" : "#64748b",
          }}
        >
          Explore our exclusive collection of fellowship merchandise. Every
          purchase directly supports our community initiatives.
        </Text>
      </View>

      {/* Swipeable TabView powered by react-native-tab-view and react-native-pager-view */}
      <TabView
        navigationState={{ index: tabIndex, routes: STORE_ROUTES }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: windowWidth }}
        lazy
        lazyPreloadDistance={1}
      />

      {/* Cart FAB */}
      <CartBadge isDark={isDark} onPress={() => setCartVisible(true)} />

      {/* Floating Action Button (+) for Admins/Leaders */}
      {isAdmin && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
                () => {},
              );
            }
            router.push("/marketplace/manage");
          }}
          accessibilityRole="button"
          accessibilityLabel="Add New Product"
          style={[
            styles.fabBtn,
            {
              backgroundColor: PRIMARY,
              bottom: Math.max(bottom, 12) + (cartCount > 0 ? 92 : 24),
            },
          ]}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Cart Sheet */}
      <CartSheet
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        isDark={isDark}
      />

      <ProductBottomSheet
        visible={bottomSheetVisible}
        onClose={() => {
          setBottomSheetVisible(false);
          setSelectedProduct(null);
        }}
        isDark={isDark}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onBuyNow={(product, quantity) => {
          handleAddToCart(product, quantity);
          setCartVisible(true);
        }}
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

const styles = StyleSheet.create({
  tabBarStyle: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBarItem: {
    width: "auto",
    minWidth: 72,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  tabLabelText: {
    fontSize: 13.5,
    letterSpacing: -0.2,
  },
  tabNewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  fabBtn: {
    position: "absolute",
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
    zIndex: 60,
  },
});
