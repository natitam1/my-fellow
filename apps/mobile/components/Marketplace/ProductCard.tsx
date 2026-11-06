import {
  Product,
  getProductImage,
  getProductPrice,
} from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

interface ProductCardProps {
  product: Product;
  isDark: boolean;
  onPress: () => void;
  onBuy: () => void;
}

const ProductCard = ({ product, isDark, onPress, onBuy }: ProductCardProps) => {
  const imageUri = getProductImage(product);
  const price = getProductPrice(product);

  const isRecentlyCreated = () => {
    if (!product.createdAt) return false;
    const createdDate = new Date(product.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const showNewBadge = product.isNew || isRecentlyCreated();

  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      <Pressable
        onPress={onPress}
        android_ripple={{
          color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
          foreground: true,
        }}
        style={({ pressed }) => [
          styles.pressableInner,
          Platform.OS === "ios" && pressed && { opacity: 0.88 },
        ]}
      >
        {showNewBadge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}

        <View
          style={[
            styles.imageContainer,
            { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
          ]}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            contentFit="cover"
            transition={200}
            recyclingKey={imageUri}
          />
        </View>

        <View style={styles.content}>
          <View>
            <Text
              numberOfLines={1}
              style={[styles.name, isDark ? styles.textDark : styles.textLight]}
            >
              {product.title || product.name || "Product"}
            </Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#ffb800" />
              <Text
                style={[
                  styles.ratingText,
                  { color: isDark ? "#a1a1aa" : "#71717a" },
                ]}
              >
                4.9
              </Text>
            </View>

            {product.shortDescription && (
              <Text
                numberOfLines={2}
                style={[
                  styles.description,
                  { color: isDark ? "#a1a1aa" : "#71717a" },
                ]}
              >
                {product.shortDescription}
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.price}>{price.toFixed(2)} ETB</Text>
            <Pressable
              style={({ pressed }) => [
                styles.buyButton,
                Platform.OS === "ios" &&
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
              ]}
              onPress={(e) => {
                e.stopPropagation?.();
                onBuy();
              }}
              android_ripple={{
                color: "rgba(255, 255, 255, 0.25)",
                borderless: false,
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityLabel={`Buy ${product.title || "product"}`}
            >
              <Ionicons name="cart" size={15} color="#ffffff" />
              <Text style={styles.buyButtonText}>Buy</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 275,
    marginVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  pressableInner: {
    width: "100%",
    flex: 1,
  },
  cardLight: {
    backgroundColor: "#fff",
    borderColor: "#f1f1f1",
  },
  cardDark: {
    backgroundColor: "#1c1c1e",
    borderColor: "#2c2c2e",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  imageContainer: {
    width: "100%",
    height: 145,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 12,
    flex: 1,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 14.5,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  textLight: { color: "#18181b" },
  textDark: { color: "#fafafa" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
  },
  description: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 4,
  },
  price: {
    fontSize: 14.5,
    color: "#ff6719",
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6.5,
    borderRadius: 16,
    backgroundColor: "#ff6719",
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});

export default ProductCard;
