import { AdminGuardFallback } from "@/components/Admin/AdminGuardFallback";
import { AppBottomSheet } from "@/components/AppBottomSheet";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { InfoModal } from "@/components/Modals/InfoModal";
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
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PRODUCT_CATEGORIES: CategoryOption[] = [
  {
    key: "t-shirt",
    label: "T-Shirts & Polos",
    desc: "Fellowship branded t-shirts, polos, and casual campus wear",
    icon: "shirt-outline",
  },
  {
    key: "hoodie",
    label: "Hoodies & Sweaters",
    desc: "Warm campus fellowship hoodies, sweaters, and zip-ups",
    icon: "snow-outline",
  },
  {
    key: "stickers",
    label: "Stickers & Decals",
    desc: "Durable vinyl laptop stickers, notebook decals, and seals",
    icon: "sparkles-outline",
  },
  {
    key: "accessories",
    label: "Accessories & Gear",
    desc: "Lanyards, wristbands, notebooks, bookmarks, and badges",
    icon: "key-outline",
  },
  {
    key: "others",
    label: "Others & Ministry Crafts",
    desc: "Special fellowship merchandise, study bibles, and crafts",
    icon: "grid-outline",
  },
];

// Minimalistic skeleton placeholder matching manage form layout
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
    <View style={{ padding: 20 }}>
      {/* Photo carousel skeleton */}
      <Animated.View
        style={[
          { height: 110, width: "100%", borderRadius: 16, backgroundColor: bg, marginBottom: 24 },
          animatedStyle,
        ]}
      />
      {/* Title input skeleton */}
      <Animated.View
        style={[
          { height: 52, width: "100%", borderRadius: 16, backgroundColor: bg, marginBottom: 20 },
          animatedStyle,
        ]}
      />
      {/* Category input skeleton */}
      <Animated.View
        style={[
          { height: 52, width: "100%", borderRadius: 16, backgroundColor: bg, marginBottom: 20 },
          animatedStyle,
        ]}
      />
      {/* Price & Stock row skeleton */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
        <Animated.View
          style={[
            { height: 52, flex: 1, borderRadius: 16, backgroundColor: bg },
            animatedStyle,
          ]}
        />
        <Animated.View
          style={[
            { height: 52, flex: 1, borderRadius: 16, backgroundColor: bg },
            animatedStyle,
          ]}
        />
      </View>
      {/* Description textarea skeleton */}
      <Animated.View
        style={[
          { height: 120, width: "100%", borderRadius: 16, backgroundColor: bg, marginBottom: 28 },
          animatedStyle,
        ]}
      />
      {/* Button skeleton */}
      <Animated.View
        style={[
          { height: 52, width: "100%", borderRadius: 16, backgroundColor: bg },
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
  const [category, setCategory] = useState<string>("t-shirt");
  const [images, setImages] = useState<ImageItem[]>([]);

  const hasUnsavedChanges =
    !submitting &&
    (title.trim().length > 0 ||
      shortDescription.trim().length > 0 ||
      price.trim().length > 0 ||
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
    if (!shortDescription.trim() || shortDescription.trim().length < 5) {
      return "Product description must be at least 5 characters.";
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return "Please enter a valid price in ETB.";
    }
    const parsedStock = parseInt(stock);
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
      const parsedStock = parseInt(stock);

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
            const filename = img.uri.split("/").pop() || `product_${idx}.jpg`;
            const match = /\.(\w+)$/.exec(filename);
            const fileType = match ? `image/${match[1]}` : "image/jpeg";
            formData.append("images", {
              uri: img.uri,
              name: filename,
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
      const isOffline =
        !err?.response &&
        (err?.message?.includes("Network") ||
          err?.code === "ECONNABORTED" ||
          err?.code === "ERR_NETWORK");
      setInfoModal({
        visible: true,
        title: isOffline ? "Connection Issue" : "Save Failed",
        message: isOffline
          ? "Network connection issue. Please check your internet connection and try again."
          : err?.response?.data?.message ||
            err?.message ||
            "Could not save product.",
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

  const textColor = isDark ? "#FAFAFA" : "#0F172A";
  const subTextColor = isDark ? "#A1A1AA" : "#64748B";
  const cardBg = isDark ? "#1C1C1E" : "#FFFFFF";
  const borderColor = isDark ? "#27272A" : "#E2E8F0";

  return (
    <View style={[styles.screen, { backgroundColor: isDark ? "#121214" : "#F8FAFC" }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScreenHeader title={isEditing ? "Edit Store Product" : "Post Store Product"} />

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
              { paddingBottom: Math.max(insets.bottom + 32, 48) },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Photos Carousel */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.label, { color: textColor }]}>
                  Product Images ({images.length}/4) <Text style={styles.required}>*</Text>
                </Text>
                {images.length < 4 && (
                  <TouchableOpacity
                    onPress={() => setPhotoSheetVisible(true)}
                    style={styles.addPhotosLink}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle" size={16} color={PRIMARY} />
                    <Text style={styles.addPhotosLinkText}>Add Photos</Text>
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryRow}
              >
                {images.map((img, idx) => (
                  <View key={idx} style={[styles.imageCard, { borderColor }]}>
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
                        <Ionicons name="star" size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
                        <Text style={styles.coverBadgeText}>Cover</Text>
                      </View>
                    )}
                  </View>
                ))}

                {images.length < 4 && (
                  <Pressable
                    onPress={() => setPhotoSheetVisible(true)}
                    style={({ pressed }) => [
                      styles.imageCard,
                      styles.imageCardAdd,
                      {
                        backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
                        borderColor: pressed ? PRIMARY : borderColor,
                      },
                    ]}
                  >
                    <View style={styles.addPhotoIconCircle}>
                      <Ionicons name="camera" size={24} color={PRIMARY} />
                    </View>
                    <Text style={[styles.addPhotoText, { color: subTextColor }]}>
                      Add Photo
                    </Text>
                  </Pressable>
                )}
              </ScrollView>
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
                placeholder="e.g. 4 Kilo Fellowship Black Hoodie"
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                onFocus={() => setFocusedField("title")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.input,
                  {
                    backgroundColor: cardBg,
                    borderColor: focusedField === "title" ? PRIMARY : borderColor,
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
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  }
                  setCategorySheetVisible(true);
                }}
                style={[
                  styles.categorySelectorBtn,
                  {
                    backgroundColor: cardBg,
                    borderColor,
                  },
                ]}
                activeOpacity={0.8}
              >
                <View style={styles.categorySelectorLeft}>
                  <View style={styles.categoryIconWrap}>
                    <Ionicons
                      name={selectedCategoryOption.icon}
                      size={18}
                      color={PRIMARY}
                    />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.categorySelectorTitle, { color: textColor }]}>
                      {selectedCategoryOption.label}
                    </Text>
                    <Text style={[styles.categorySelectorSub, { color: subTextColor }]}>
                      {selectedCategoryOption.desc}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={subTextColor} />
              </TouchableOpacity>
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
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  onFocus={() => setFocusedField("price")}
                  onBlur={() => setFocusedField(null)}
                  style={[
                    styles.input,
                    {
                      backgroundColor: cardBg,
                      borderColor: focusedField === "price" ? PRIMARY : borderColor,
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
                  placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                  onFocus={() => setFocusedField("stock")}
                  onBlur={() => setFocusedField(null)}
                  style={[
                    styles.input,
                    {
                      backgroundColor: cardBg,
                      borderColor: focusedField === "stock" ? PRIMARY : borderColor,
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
                placeholder="Describe material, sizes (S/M/L/XL), fabric quality, and fellowship scripture badge details..."
                placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                style={[
                  styles.input,
                  styles.textarea,
                  {
                    backgroundColor: cardBg,
                    borderColor: focusedField === "description" ? PRIMARY : borderColor,
                    color: textColor,
                  },
                ]}
              />
            </View>

            {/* Campus Pickup Notice Box */}
            <View
              style={[
                styles.noticeBox,
                {
                  backgroundColor: isDark ? "#1C1C1E" : "#FFF7ED",
                  borderColor: isDark ? "#2C2C2E" : "#FFEDD5",
                },
              ]}
            >
              <Ionicons name="location" size={20} color={PRIMARY} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.noticeTitle, { color: isDark ? "#FAFAFA" : "#9A3412" }]}>
                  Campus Delivery & Handoff
                </Text>
                <Text style={[styles.noticeDesc, { color: isDark ? "#A1A1AA" : "#C2410C" }]}>
                  Orders placed by fellowship members are prepared for in-person pickup at the 4 Kilo Fellowship Office.
                </Text>
              </View>
            </View>

            {/* Submit Primary Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={[styles.submitBtn, submitting && { opacity: 0.75 }]}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {submitting
                  ? "Saving Product..."
                  : isEditing
                    ? "Save Changes"
                    : "Publish Product to Store"}
              </Text>
            </TouchableOpacity>

            {/* Delete Button (Editing Only) */}
            {isEditing && (
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(true)}
                disabled={deleting}
                style={styles.deleteBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.deleteBtnText}>Delete Product</Text>
              </TouchableOpacity>
            )}
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
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    }
                    setCategory(cat.key);
                    setCategorySheetVisible(false);
                  }}
                  style={[
                    styles.categoryOptionCard,
                    {
                      backgroundColor: cardBg,
                      borderColor: isSelected ? PRIMARY : borderColor,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.categoryOptionLeft}>
                    <View
                      style={[
                        styles.categoryIconWrap,
                        isSelected && { backgroundColor: "rgba(255, 103, 25, 0.15)" },
                      ]}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={20}
                        color={isSelected ? PRIMARY : subTextColor}
                      />
                    </View>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text
                        style={[
                          styles.categoryOptionLabel,
                          { color: isSelected ? PRIMARY : textColor },
                        ]}
                      >
                        {cat.label}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[styles.categoryOptionDesc, { color: subTextColor }]}
                      >
                        {cat.desc}
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
            <TouchableOpacity
              onPress={handlePickFromGallery}
              style={[
                styles.photoOptionBtn,
                { backgroundColor: cardBg, borderColor },
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.photoOptionIconCircle}>
                <Ionicons name="images" size={22} color={PRIMARY} />
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={[styles.photoOptionTitle, { color: textColor }]}>
                  Choose from Gallery
                </Text>
                <Text style={[styles.photoOptionSub, { color: subTextColor }]}>
                  Pick one or multiple high-quality product images
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTakePhotoWithCamera}
              style={[
                styles.photoOptionBtn,
                { backgroundColor: cardBg, borderColor },
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.photoOptionIconCircle}>
                <Ionicons name="camera" size={22} color={PRIMARY} />
              </View>
              <View style={{ marginLeft: 14 }}>
                <Text style={[styles.photoOptionTitle, { color: textColor }]}>
                  Take Photo with Camera
                </Text>
                <Text style={[styles.photoOptionSub, { color: subTextColor }]}>
                  Capture product or apparel details directly
                </Text>
              </View>
            </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 16,
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
  },
  required: {
    color: PRIMARY,
    fontWeight: "800",
  },
  charCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  addPhotosLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addPhotosLinkText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
  },
  galleryRow: {
    gap: 12,
    paddingVertical: 4,
  },
  imageCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    position: "relative",
  },
  imageCardThumb: {
    width: "100%",
    height: "100%",
  },
  imageCardAdd: {
    alignItems: "center",
    justifyContent: "center",
    borderStyle: "dashed",
  },
  addPhotoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  addPhotoText: {
    fontSize: 11,
    fontWeight: "700",
  },
  removePhotoBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: "500",
  },
  textarea: {
    height: 120,
    paddingTop: 14,
    paddingBottom: 14,
  },
  categorySelectorBtn: {
    height: 64,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categorySelectorLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 103, 25, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  categorySelectorTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  categorySelectorSub: {
    fontSize: 12,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  noticeDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  submitBtn: {
    backgroundColor: PRIMARY,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    marginBottom: 12,
  },
  deleteBtnText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
  // Sheet Styles
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
  categoryOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
  },
  categoryOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  categoryOptionLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  categoryOptionDesc: {
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
  photoOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
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
});
