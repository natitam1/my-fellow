import { AdminGuardFallback } from "@/components/Admin/AdminGuardFallback";
import { AppBottomSheet } from "@/components/AppBottomSheet";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { InfoModal } from "@/components/Modals/InfoModal";
import { NativeViewAllButton } from "@/components/NativeViewAllButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useConfirmUnsavedChanges } from "@/hooks/useConfirmUnsavedChanges";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useMarketplaceStore } from "@/stores/marketplace.store";
import { Product } from "@/types/marketplace.types";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

interface ImageItem {
  uri: string;
  isLocal: boolean;
}

interface CategoryOption {
  key: string;
  label: string;
  desc?: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PRODUCT_CATEGORIES: CategoryOption[] = [
  {
    key: "t-shirt",
    label: "T-Shirts",
    icon: "shirt-outline",
  },
  {
    key: "hoodie",
    label: "Hoodies",
    icon: "snow-outline",
  },
  {
    key: "soap",
    label: "Natural Soap",
    icon: "water-outline",
  },
  {
    key: "stickers",
    label: "Stickers",
    icon: "sparkles-outline",
  },
  {
    key: "accessories",
    label: "Accessories",
    icon: "key-outline",
  },
  {
    key: "others",
    label: "Other Merchandise",
    icon: "grid-outline",
  },
];

// Minimalistic skeleton placeholder matching event manage form layout
const ManageProductSkeleton = ({ isDark }: { isDark: boolean }) => {
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
    <View style={{ padding: 16 }}>
      {/* Banner / Photo carousel skeleton */}
      <Animated.View
        style={[
          {
            height: 120,
            width: "100%",
            borderRadius: 16,
            backgroundColor: bg,
            marginBottom: 20,
          },
          animatedStyle,
        ]}
      />
      {/* Title skeleton */}
      <Animated.View
        style={[
          {
            height: 50,
            width: "100%",
            borderRadius: 14,
            backgroundColor: bg,
            marginBottom: 20,
          },
          animatedStyle,
        ]}
      />
      {/* Category skeleton */}
      <Animated.View
        style={[
          {
            height: 50,
            width: "100%",
            borderRadius: 14,
            backgroundColor: bg,
            marginBottom: 20,
          },
          animatedStyle,
        ]}
      />
      {/* Price & Stock row skeleton */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <Animated.View
          style={[
            { height: 50, flex: 1, borderRadius: 14, backgroundColor: bg },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            { height: 50, flex: 1, borderRadius: 14, backgroundColor: bg },
            animatedStyle,
          ]}
        />
      </View>
      {/* Description textarea skeleton */}
      <Animated.View
        style={[
          {
            height: 110,
            width: "100%",
            borderRadius: 14,
            backgroundColor: bg,
            marginBottom: 24,
          },
          animatedStyle,
        ]}
      />
      {/* Submit button skeleton */}
      <Animated.View
        style={[
          {
            height: 52,
            width: "100%",
            borderRadius: 26,
            backgroundColor: bg,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

export default function ManageProductScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProductById,
  } = useMarketplaceStore();

  const [loadingInitial, setLoadingInitial] = useState<boolean>(isEditing);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);

  // Focus tracking for input borders
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Bottom sheet states
  const [categorySheetVisible, setCategorySheetVisible] = useState<boolean>(false);
  const [photoSheetVisible, setPhotoSheetVisible] = useState<boolean>(false);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<string>("10");
  const [category, setCategory] = useState<string>("");
  const [images, setImages] = useState<ImageItem[]>([]);

  const hasUnsavedChanges =
    !submitting &&
    (title.trim().length > 0 ||
      shortDescription.trim().length > 0 ||
      price.trim().length > 0 ||
      category.length > 0 ||
      images.length > 0);

  useConfirmUnsavedChanges(hasUnsavedChanges, {
    title: "Discard product changes?",
    message: "You have unsaved changes to this store product.",
    discardLabel: "Discard",
    continueLabel: "Keep Editing",
  });

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "info" });

  useEffect(() => {
    if (!isEditing || !id) {
      setLoadingInitial(false);
      return;
    }

    const existing = products.find(
      (p) => p.id === id || (p as any)._id === id,
    );
    if (existing) {
      populateForm(existing);
      setLoadingInitial(false);
    } else {
      fetchProductById(id)
        .then(() => {
          const current = useMarketplaceStore.getState().currentProduct;
          if (current) populateForm(current);
        })
        .finally(() => setLoadingInitial(false));
    }
  }, [id, isEditing, products]);

  const populateForm = (item: Product) => {
    setTitle(item.title || item.name || "");
    setShortDescription(item.shortDescription || item.description || "");
    setPrice(item.price !== undefined ? String(item.price) : "");
    setStock(item.stock !== undefined ? String(item.stock) : "10");

    const matchedCat = PRODUCT_CATEGORIES.find(
      (c) => c.key === (item.category || "").toLowerCase(),
    );
    setCategory(matchedCat ? matchedCat.key : "others");

    const urls: string[] = [];
    if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
      urls.push(...item.imageUrls);
    } else if (item.imageUrl) {
      urls.push(item.imageUrl);
    } else if (item.image) {
      urls.push(item.image);
    }

    setImages(urls.map((u) => ({ uri: u, isLocal: false })));
  };

  const handlePickFromGallery = async () => {
    setPhotoSheetVisible(false);
    if (images.length >= 4) {
      setInfoModal({
        visible: true,
        title: "Photo Limit Reached",
        message: "You can add up to 4 images per product.",
        type: "info",
      });
      return;
    }

    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setInfoModal({
          visible: true,
          title: "Permission Required",
          message: "Please allow photo library access to upload product images.",
          type: "info",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: 4 - images.length,
        quality: 0.85,
      });

      if (!result.canceled && result.assets) {
        const newImgs: ImageItem[] = result.assets.map((a) => ({
          uri: a.uri,
          isLocal: true,
        }));
        setImages([...images, ...newImgs].slice(0, 4));
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }
    } catch {
      setInfoModal({
        visible: true,
        title: "Image Selection Error",
        message: "Failed to select images from gallery. Please try again.",
        type: "error",
      });
    }
  };

  const handleTakePhotoWithCamera = async () => {
    setPhotoSheetVisible(false);
    if (images.length >= 4) {
      setInfoModal({
        visible: true,
        title: "Photo Limit Reached",
        message: "You can add up to 4 images per product.",
        type: "info",
      });
      return;
    }

    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        setInfoModal({
          visible: true,
          title: "Camera Permission Required",
          message: "Please allow camera access to take a photo of the product.",
          type: "info",
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([
          ...images,
          { uri: result.assets[0].uri, isLocal: true },
        ].slice(0, 4));
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
      }
    } catch {
      setInfoModal({
        visible: true,
        title: "Camera Error",
        message: "Failed to take photo with camera.",
        type: "error",
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const validate = (): string | null => {
    if (!title.trim() || title.trim().length < 3) {
      return "Product title must be at least 3 characters.";
    }
    if (!category || !category.trim()) {
      return "Please select a product category.";
    }
    if (!shortDescription.trim() || shortDescription.trim().length < 5) {
      return "Product description must be at least 5 characters.";
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return "Please enter a valid price in ETB.";
    }
    const parsedStock = parseInt(stock, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return "Please enter a valid stock quantity.";
    }
    if (images.length === 0) {
      return "Please add at least one product photo for members to view.";
    }
    return null;
  };

  const handleSubmit = async () => {
    const errorMsg = validate();
    if (errorMsg) {
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
          () => {},
        );
      }
      setInfoModal({
        visible: true,
        title: "Validation Error",
        message: errorMsg,
        type: "error",
      });
      return;
    }

    try {
      setSubmitting(true);
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock, 10);

      const hasLocalImages = images.some((img) => img.isLocal);

      let payload: any;
      if (hasLocalImages) {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("shortDescription", shortDescription.trim());
        formData.append("price", String(parsedPrice));
        formData.append("stock", String(parsedStock));
        formData.append("category", category);

        const remoteUrls = images.filter((i) => !i.isLocal).map((i) => i.uri);
        if (remoteUrls.length > 0) {
          formData.append("imageUrls", JSON.stringify(remoteUrls));
        }

        images
          .filter((i) => i.isLocal)
          .forEach((img, idx) => {
            const rawUri = img.uri;
            const normalizedUri =
              Platform.OS === "ios" ? rawUri.replace("file://", "") : rawUri;
            let filename =
              rawUri.split("/").pop() || `product_${Date.now()}_${idx}.jpg`;
            const extMatch = /\.(\w+)$/.exec(filename);
            const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
            const fileType =
              ext === "png"
                ? "image/png"
                : ext === "webp"
                ? "image/webp"
                : ext === "gif"
                ? "image/gif"
                : "image/jpeg";
            const safeName = filename.includes(".")
              ? filename
              : `${filename}.${ext}`;
            formData.append("images", {
              uri: normalizedUri,
              name: safeName,
              type: fileType,
            } as any);
          });

        payload = formData;
      } else {
        payload = {
          title: title.trim(),
          shortDescription: shortDescription.trim(),
          price: parsedPrice,
          stock: parsedStock,
          category,
          imageUrls: images.map((i) => i.uri),
        };
      }

      if (isEditing && id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      }
      setInfoModal({
        visible: true,
        title: "Product Saved",
        message: `Product has been successfully ${isEditing ? "updated" : "published to the fellowship store"}.`,
        type: "success",
      });

      setTimeout(() => {
        router.back();
      }, 1200);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not save product. Please try again.";
      const isForbidden = err?.response?.status === 403;
      const isOffline =
        !err?.response &&
        (err?.message?.includes("Network") ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ERR_NETWORK");
      setInfoModal({
        visible: true,
        title: isForbidden
          ? "Permission Denied"
          : isOffline
          ? "Connection Issue"
          : "Save Failed",
        message: errorMsg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setDeleting(true);
      await deleteProduct(id);
      setDeleteModalVisible(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {},
        );
      }
      setInfoModal({
        visible: true,
        title: "Product Deleted",
        message: "The product has been removed from the fellowship store.",
        type: "success",
      });
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      setInfoModal({
        visible: true,
        title: "Delete Failed",
        message: err?.response?.data?.message || err?.message || "Could not delete product.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (!isAdmin) {
    return <AdminGuardFallback title="Manage Fellowship Product" />;
  }

  const selectedCategoryOption =
    PRODUCT_CATEGORIES.find((c) => c.key === category) || PRODUCT_CATEGORIES[0];

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const subTextColor = isDark ? "#a1a1aa" : "#64748b";
  const cardBg = isDark ? "#18181b" : "#ffffff";
  const borderColor = isDark ? "#27272a" : "#cbd5e1";
  const rippleColor = isDark
    ? "rgba(255, 255, 255, 0.12)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? "#0A0A0A" : "#ffffff" }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader
        title={isEditing ? "Edit Product" : "Post Product"}
        containerStyle={{
          backgroundColor: isDark ? "#0A0A0A" : "#ffffff",
          borderBottomColor: isDark ? "#27272a" : "#e2e8f0",
        }}
      />

      {loadingInitial ? (
        <ManageProductSkeleton isDark={isDark} />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 24, 40) },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Photos Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.label, { color: textColor }]}>
                  Product Images ({images.length}/4) <Text style={styles.required}>*</Text>
                </Text>
                {images.length > 0 && images.length < 4 && (
                  <NativeViewAllButton
                    label="Add Photos"
                    onPress={() => setPhotoSheetVisible(true)}
                    isDark={isDark}
                    accessibilityLabel="Add product photos"
                  />
                )}
              </View>

              {images.length === 0 ? (
                <View
                  style={[
                    styles.uploadPlaceholderContainer,
                    {
                      borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                      backgroundColor: isDark ? "#18181b" : "#f8fafc",
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => setPhotoSheetVisible(true)}
                    android_ripple={{
                      color: rippleColor,
                      borderless: false,
                      foreground: true,
                    }}
                    style={styles.uploadPlaceholderInner}
                  >
                    <View style={styles.uploadIconCircle}>
                      <Ionicons name="cloud-upload-outline" size={26} color={PRIMARY} />
                    </View>
                    <Text style={[styles.uploadTitle, { color: textColor }]}>
                      Tap to upload product photos
                    </Text>
                    <Text style={[styles.uploadSubtitle, { color: subTextColor }]}>
                      Select up to 4 images (first image will be the product cover)
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleryRow}
                >
                  {images.map((img, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.imageCard,
                        { borderColor: isDark ? "#27272a" : "#e2e8f0" },
                      ]}
                    >
                      <ExpoImage
                        source={{ uri: img.uri }}
                        style={styles.imageCardThumb}
                        contentFit="cover"
                        transition={200}
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(idx)}
                        style={styles.removePhotoBadge}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="close" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      {idx === 0 && (
                        <View style={styles.coverBadge}>
                          <Ionicons
                            name="star"
                            size={10}
                            color="#FFFFFF"
                            style={{ marginRight: 2 }}
                          />
                          <Text style={styles.coverBadgeText}>Cover</Text>
                        </View>
                      )}
                      {img.isLocal && idx !== 0 && (
                        <View style={[styles.coverBadge, styles.newPhotoBadge]}>
                          <Ionicons
                            name="cloud-upload-outline"
                            size={10}
                            color="#FFFFFF"
                            style={{ marginRight: 2 }}
                          />
                          <Text style={styles.coverBadgeText}>New</Text>
                        </View>
                      )}
                    </View>
                  ))}

                  {images.length < 4 && (
                    <View
                      style={[
                        styles.imageCard,
                        styles.imageCardAdd,
                        {
                          backgroundColor: isDark ? "#18181b" : "#f8fafc",
                          borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                        },
                      ]}
                    >
                      <Pressable
                        onPress={() => setPhotoSheetVisible(true)}
                        android_ripple={{
                          color: rippleColor,
                          borderless: false,
                          foreground: true,
                        }}
                        style={styles.imageCardAddInner}
                      >
                        <View style={styles.addPhotoIconCircle}>
                          <Ionicons
                            name="camera-outline"
                            size={24}
                            color={PRIMARY}
                          />
                        </View>
                        <Text style={[styles.addPhotoText, { color: subTextColor }]}>
                          Add Photo
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>

            {/* Product Title Input */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.label, { color: textColor }]}>
                  Product Title <Text style={styles.required}>*</Text>
                </Text>
                <Text style={[styles.charCount, { color: subTextColor }]}>
                  {title.length}/100
                </Text>
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                placeholder="e.g. 4 Kilo Fellowship Classic Tee"
                placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                onFocus={() => setFocusedField("title")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.input,
                  {
                    backgroundColor: cardBg,
                    borderColor:
                      focusedField === "title" ? PRIMARY : borderColor,
                    color: textColor,
                  },
                ]}
              />
            </View>

            {/* Category Selector (Native Bottom Sheet trigger) */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: textColor }]}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <View
                style={[
                  styles.categorySelectorWrap,
                  {
                    backgroundColor: cardBg,
                    borderColor: borderColor,
                  },
                ]}
              >
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                        () => {},
                      );
                    }
                    setCategorySheetVisible(true);
                  }}
                  android_ripple={{
                    color: rippleColor,
                    borderless: false,
                    foreground: true,
                  }}
                  style={styles.categorySelectorInner}
                >
                  <View style={styles.categorySelectorLeft}>
                    <Ionicons
                      name={
                        selectedCategoryOption
                          ? selectedCategoryOption.icon
                          : "grid-outline"
                      }
                      size={20}
                      color={selectedCategoryOption ? PRIMARY : subTextColor}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.categorySelectorText,
                        {
                          color: selectedCategoryOption
                            ? textColor
                            : isDark
                              ? "#52525b"
                              : "#94a3b8",
                          fontWeight: selectedCategoryOption ? "600" : "500",
                        },
                      ]}
                    >
                      {selectedCategoryOption
                        ? selectedCategoryOption.label
                        : "Select category..."}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={subTextColor}
                  />
                </Pressable>
              </View>
            </View>

            {/* Price & Stock Dual Column */}
            <View style={styles.row}>
              <View style={[styles.section, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.label, { color: textColor }]}>
                  Price (ETB) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="e.g. 650"
                  placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                  onFocus={() => setFocusedField("price")}
                  onBlur={() => setFocusedField(null)}
                  style={[
                    styles.input,
                    {
                      backgroundColor: cardBg,
                      borderColor:
                        focusedField === "price" ? PRIMARY : borderColor,
                      color: textColor,
                    },
                  ]}
                />
              </View>

              <View style={[styles.section, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.label, { color: textColor }]}>
                  Stock Qty <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={stock}
                  onChangeText={setStock}
                  keyboardType="numeric"
                  placeholder="e.g. 25"
                  placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                  onFocus={() => setFocusedField("stock")}
                  onBlur={() => setFocusedField(null)}
                  style={[
                    styles.input,
                    {
                      backgroundColor: cardBg,
                      borderColor:
                        focusedField === "stock" ? PRIMARY : borderColor,
                      color: textColor,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Description Textarea */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.label, { color: textColor }]}>
                  Description & Specifications <Text style={styles.required}>*</Text>
                </Text>
                <Text style={[styles.charCount, { color: subTextColor }]}>
                  {shortDescription.length}/300
                </Text>
              </View>
              <TextInput
                value={shortDescription}
                onChangeText={setShortDescription}
                maxLength={300}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Describe material, sizes (S/M/L/XL), fabric quality, and fellowship scripture details..."
                placeholderTextColor={isDark ? "#52525b" : "#94a3b8"}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.input,
                  styles.textarea,
                  {
                    backgroundColor: cardBg,
                    borderColor:
                      focusedField === "description" ? PRIMARY : borderColor,
                    color: textColor,
                  },
                ]}
              />
            </View>

            {/* Submit Action - Fully rounded pill matching event screen */}
            <View style={styles.submitSection}>
              <View
                style={[
                  styles.submitBtnWrap,
                  { backgroundColor: PRIMARY },
                ]}
              >
                <Pressable
                  onPress={handleSubmit}
                  disabled={submitting || deleting}
                  android_ripple={{
                    color: "rgba(255, 255, 255, 0.3)",
                    borderless: false,
                    foreground: true,
                  }}
                  style={styles.submitBtnInner}
                >
                  {submitting ? (
                    <View style={styles.btnContent}>
                      <ActivityIndicator color="#ffffff" size="small" />
                      <Text style={styles.submitButtonText}>
                        {isEditing ? "Saving Changes..." : "Publishing Product..."}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.btnContent}>
                      <Ionicons
                        name={
                          isEditing
                            ? "checkmark-circle-outline"
                            : "paper-plane-outline"
                        }
                        size={20}
                        color="#ffffff"
                      />
                      <Text style={styles.submitButtonText}>
                        {isEditing ? "Save Changes" : "Publish Product to Store"}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {/* Delete Option (Editing Mode Only) - Fully rounded pill */}
              {isEditing && (
                <View style={styles.deleteBtnWrap}>
                  <Pressable
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Medium,
                        ).catch(() => {});
                      }
                      setDeleteModalVisible(true);
                    }}
                    disabled={submitting || deleting}
                    android_ripple={{
                      color: "rgba(239, 68, 68, 0.25)",
                      borderless: false,
                      foreground: true,
                    }}
                    style={styles.deleteBtnInner}
                  >
                    {deleting ? (
                      <ActivityIndicator color="#ef4444" size="small" />
                    ) : (
                      <View style={styles.btnContent}>
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color="#ef4444"
                        />
                        <Text style={styles.deleteButtonText}>Delete Product</Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* Category Native AppBottomSheet */}
      <AppBottomSheet
        visible={categorySheetVisible}
        onClose={() => setCategorySheetVisible(false)}
        isDark={isDark}
        snapPoints={["half", "full"]}
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: textColor }]}>
            Select Category
          </Text>
          <Text style={[styles.sheetSubtitle, { color: subTextColor }]}>
            Choose where this item should appear in the fellowship store
          </Text>

          <View style={styles.categoryList}>
            {PRODUCT_CATEGORIES.map((cat) => {
              const isSelected = category === cat.key;
              return (
                <View
                  key={cat.key}
                  style={[
                    styles.categoryOptionCardWrap,
                    {
                      backgroundColor: cardBg,
                      borderColor: isSelected ? PRIMARY : borderColor,
                      borderWidth: isSelected ? 2 : 1.5,
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
                      setCategory(cat.key);
                      setCategorySheetVisible(false);
                    }}
                    android_ripple={{
                      color: rippleColor,
                      borderless: false,
                      foreground: true,
                    }}
                    style={styles.categoryOptionInner}
                  >
                    <View style={styles.categoryOptionLeft}>
                      <View
                        style={[
                          styles.categoryIconWrap,
                          isSelected && {
                            backgroundColor: "rgba(255, 103, 25, 0.15)",
                          },
                        ]}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={20}
                          color={isSelected ? PRIMARY : subTextColor}
                        />
                      </View>
                      <Text
                        style={[
                          styles.categoryOptionLabel,
                          { color: isSelected ? PRIMARY : textColor },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && {
                          borderColor: PRIMARY,
                          backgroundColor: PRIMARY,
                        },
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      )}
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      </AppBottomSheet>

      {/* Photo Picker Native AppBottomSheet */}
      <AppBottomSheet
        visible={photoSheetVisible}
        onClose={() => setPhotoSheetVisible(false)}
        isDark={isDark}
        snapPoints={["half"]}
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, { color: textColor }]}>
            Add Product Photos
          </Text>
          <Text style={[styles.sheetSubtitle, { color: subTextColor }]}>
            Select how you would like to add photos (up to 4)
          </Text>

          <View style={{ gap: 12, marginTop: 16 }}>
            <View
              style={[
                styles.photoOptionWrap,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <Pressable
                onPress={handlePickFromGallery}
                android_ripple={{
                  color: rippleColor,
                  borderless: false,
                  foreground: true,
                }}
                style={styles.photoOptionInner}
              >
                <View style={styles.photoOptionIconCircle}>
                  <Ionicons name="images-outline" size={22} color={PRIMARY} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={[styles.photoOptionTitle, { color: textColor }]}>
                    Choose from Gallery
                  </Text>
                  <Text style={[styles.photoOptionSub, { color: subTextColor }]}>
                    Pick one or multiple high-quality product images
                  </Text>
                </View>
              </Pressable>
            </View>

            <View
              style={[
                styles.photoOptionWrap,
                { backgroundColor: cardBg, borderColor },
              ]}
            >
              <Pressable
                onPress={handleTakePhotoWithCamera}
                android_ripple={{
                  color: rippleColor,
                  borderless: false,
                  foreground: true,
                }}
                style={styles.photoOptionInner}
              >
                <View style={styles.photoOptionIconCircle}>
                  <Ionicons name="camera-outline" size={22} color={PRIMARY} />
                </View>
                <View style={{ marginLeft: 14, flex: 1 }}>
                  <Text style={[styles.photoOptionTitle, { color: textColor }]}>
                    Take Photo with Camera
                  </Text>
                  <Text style={[styles.photoOptionSub, { color: subTextColor }]}>
                    Capture product or apparel details directly
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </AppBottomSheet>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        isDark={isDark}
        icon="trash-outline"
        iconColor="#ef4444"
        title="Delete Product"
        description="Are you sure you want to remove this product from the fellowship store? This action cannot be undone."
        buttons={[
          {
            label: deleting ? "Deleting..." : "Delete",
            variant: "danger",
            onPress: handleDelete,
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />

      {/* Info Alert Modal */}
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
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  required: {
    color: PRIMARY,
  },
  charCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  uploadPlaceholderContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
  },
  uploadPlaceholderInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  uploadIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  galleryRow: {
    gap: 12,
    paddingVertical: 4,
  },
  imageCard: {
    width: 100,
    height: 100,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    position: "relative",
  },
  imageCardThumb: {
    width: "100%",
    height: "100%",
  },
  imageCardAdd: {
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  imageCardAddInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: "700",
  },
  removePhotoBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  coverBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: PRIMARY,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  coverBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: "500",
  },
  textarea: {
    height: 110,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: "top",
  },
  categorySelectorWrap: {
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  categorySelectorInner: {
    height: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categorySelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 10,
    marginRight: 8,
  },
  categorySelectorText: {
    fontSize: 15,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  submitSection: {
    marginTop: 14,
    gap: 12,
  },
  submitBtnWrap: {
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
  },
  submitBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteBtnWrap: {
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.35)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
  },
  deleteBtnInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "700",
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  categoryList: {
    gap: 10,
  },
  categoryOptionCardWrap: {
    borderRadius: 14,
    overflow: "hidden",
  },
  categoryOptionInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
  },
  categoryOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
    marginRight: 10,
  },
  categoryOptionLabel: {
    fontSize: 15,
    fontWeight: "700",
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
  photoOptionWrap: {
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  photoOptionInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  photoOptionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoOptionTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  photoOptionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  newPhotoBadge: {
    backgroundColor: PRIMARY,
    left: 6,
    right: undefined,
  },
});
