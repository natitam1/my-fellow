import { PRIMARY } from "@/constants/colors";
import {
  Product,
  getProductImage,
  getProductPrice,
} from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      {/* Top tappable area: Image, Badge, Title, Rating */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        style={styles.cardTopTouchable}
        accessibilityRole="button"
        accessibilityLabel={`View ${product.title || product.name || "product"} details`}
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
        </View>
      </TouchableOpacity>

      {/* Footer area: Price and Independent Buy Button */}
      <View style={styles.footer}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={styles.price}
        >
          {price.toLocaleString()} ETB
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onBuy}
          style={styles.buyButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Buy ${product.title || product.name || "product"}`}
        >
          <Ionicons name="cart" size={15} color="#ffffff" />
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  cardTopTouchable: {
    width: "100%",
  },
  cardLight: {
    backgroundColor: "#ffffff",
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
    height: 140,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  textLight: { color: "#18181b" },
  textDark: { color: "#fafafa" },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingHorizontal: 10,
    paddingTop: 2,
    paddingBottom: 10,
  },
  price: {
    flex: 1,
    fontSize: 14,
    color: PRIMARY,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 62,
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: PRIMARY,
  },
  buyButtonText: {
    color: "#ffffff",
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});

export default ProductCard;
