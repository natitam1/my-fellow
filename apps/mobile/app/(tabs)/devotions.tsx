import { MainTabHeader, Placeholder } from "@/components";
import { DevotionWriterModal } from "@/components/DevotionWriterModal";
import { PRIMARY } from "@/constants";
import { OFFLINE_DEVOTIONS } from "@/constants/offlineDevotions";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { devotionsService } from "@/services/devotionsService";
import { devotionWriterService, WriterRequest } from "@/services/devotionWriterService";
import { useDevotionsStore } from "@/stores/devotions.store";
import { Devotion } from "@/types/devotion.types";
import { resolveDevotionActor, navigateToDevotionAuthor } from "@/utils/devotionActor";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Route, TabBar, TabView } from "react-native-tab-view";

const formatDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const formatViews = (views?: number, formatted?: string) => {
  if (formatted) return formatted;
  const count = views ?? 0;
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count > 0 ? String(count) : "0";
};

const formatDuration = (item: Devotion) => {
  if (item.duration) return item.duration;
  if (item.content) {
    const words = item.content.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 150));
    return `${minutes} min read`;
  }
  return item.type === "voice" ? "01:40" : "3 min read";
};

const isNewDevotion = (dateStr?: string) => {
  if (!dateStr) return true;
  try {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return isNaN(diffDays) || diffDays <= 30;
  } catch {
    return true;
  }
};

interface CompactArticleCardProps {
  item: Devotion;
  isSaved: boolean;
  isDark: boolean;
  width: number;
  imageHeight: number;
  onPress: () => void;
  onToggleSave: () => void;
}

// Compact Video / Devotional Card (Matching user reference UI, memoized)
const CompactArticleCard = React.memo<CompactArticleCardProps>(
  ({ item, isSaved, isDark, width, imageHeight, onPress, onToggleSave }) => {
    const isNew = isNewDevotion(item.date);

    return (
      <View style={[styles.compactCardOuter, { width }]}>
        <Pressable
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)",
            foreground: true,
          }}
          style={({ pressed }) => [
            styles.compactCardPressable,
            Platform.OS === "ios" && pressed && { opacity: 0.92, transform: [{ scale: 0.985 }] },
          ]}
          onPress={onPress}
        >
          {/* Card Thumbnail Image with Screenshot-accurate Overlays */}
          <View
            style={[
              styles.compactImageWrapper,
              { height: imageHeight, backgroundColor: isDark ? "#27272a" : "#e4e4e7" },
            ]}
          >
            {item.image ? (
              <ExpoImage
                source={{ uri: item.image }}
                style={styles.compactImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
            ) : (
              <View
                style={[
                  styles.compactImagePlaceholder,
                  { backgroundColor: isDark ? "#18181b" : "#f4f4f5" },
                ]}
              >
                <Ionicons name="book-outline" size={32} color={isDark ? "#71717a" : "#a1a1aa"} />
              </View>
            )}

            {/* Subtle bottom shadow overlay for time readability */}
            <View style={styles.compactImageOverlay} />

            {/* Top-Right Badge: "New" (Sage Green Pill matching reference) */}
            {isNew && (
              <View style={styles.compactNewBadge}>
                <Text style={styles.compactNewText}>New</Text>
              </View>
            )}

            {/* Bottom-Left Audio/Voice Badge */}
            {item.type === "voice" && (
              <View style={styles.compactVoiceBadge}>
                <Ionicons name="musical-notes" size={11} color="#ffffff" />
                <Text style={styles.compactVoiceText}>
                  {formatDuration(item)}
                </Text>
              </View>
            )}
          </View>

          {/* Article Info Container */}
          <View style={styles.compactBody}>
            {/* Title (2 lines bold, exactly like screenshot) */}
            <Text
              style={[
                styles.compactTitle,
                { color: isDark ? "#fafafa" : "#18181b" },
              ]}
              numberOfLines={2}
            >
              {item.title}
            </Text>

            {/* Single meta row: author · views · bookmark */}
            <View style={styles.compactMetaRow}>
              <Text
                style={[
                  styles.compactAuthor,
                  { color: isDark ? "#a1a1aa" : "#71717a" },
                ]}
                numberOfLines={1}
              >
                {item.author || "4 Kilo Fellowship"}
              </Text>

              <View style={styles.compactMetaActions}>
                <View style={styles.compactViewsRow}>
                  <Ionicons
                    name="eye-outline"
                    size={14}
                    color={isDark ? "#a1a1aa" : "#8a8a93"}
                  />
                  <Text
                    style={[
                      styles.compactViewsText,
                      { color: isDark ? "#a1a1aa" : "#71717a" },
                    ]}
                  >
                    {formatViews(item.views, item.viewsFormatted)}
                  </Text>
                </View>

                <Pressable
                  hitSlop={8}
                  android_ripple={{
                    color: "rgba(255, 103, 25, 0.2)",
                    borderless: true,
                    radius: 14,
                  }}
                  style={styles.compactBookmarkBtn}
                  onPress={(e) => {
                    e.stopPropagation();
                    onToggleSave();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={isSaved ? "Remove from saved" : "Save devotion"}
                >
                  <Ionicons
                    name={isSaved ? "bookmark" : "bookmark-outline"}
                    size={16}
                    color={isSaved ? PRIMARY : isDark ? "#71717a" : "#a1a1aa"}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </View>
    );
  },
);
CompactArticleCard.displayName = "CompactArticleCard";

interface MinimalDevotionCardProps {
  item: Devotion;
  isSaved: boolean;
  isRead: boolean;
  isDark: boolean;
  onPress: () => void;
  onAuthorPress?: () => void;
  onToggleSave: () => void;
  onShare: () => void;
}

// Elegant editorial article-style card for fellowship devotions (memoized)
const MinimalDevotionCard = React.memo<MinimalDevotionCardProps>(
  ({ item, isSaved, isRead, isDark, onPress, onAuthorPress, onToggleSave, onShare }) => {
    const actor = resolveDevotionActor(item);
    return (
      <View
        style={[
          styles.articleCardOuter,
          {
            backgroundColor: isDark ? "#18181b" : "#ffffff",
            borderColor: isDark ? "#27272a" : "#eff3f4",
          },
        ]}
      >
        <Pressable
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
            foreground: true,
          }}
          style={({ pressed }) => [
            styles.articleCardPressable,
            Platform.OS === "ios" &&
              pressed && {
                opacity: 0.96,
                backgroundColor: isDark ? "#202024" : "#fafafa",
              },
          ]}
          onPress={onPress}
        >
          {/* Top Byline: Author monogram + name, fellowship role / badge, date, bookmark */}
          <View style={styles.articleHeader}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation();
                if (onAuthorPress) {
                  onAuthorPress();
                } else {
                  onPress();
                }
              }}
              style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}
            >
              <View
                style={[
                  styles.authorAvatar,
                  {
                    backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                    borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                  },
                ]}
              >
                {actor.avatarUrl ? (
                  <ExpoImage
                    source={{ uri: actor.avatarUrl }}
                    style={{ width: "100%", height: "100%", borderRadius: 14 }}
                    contentFit="cover"
                  />
                ) : (
                  <Text
                    style={[
                      styles.authorAvatarText,
                      { color: isDark ? "#fafafa" : "#18181b" },
                    ]}
                  >
                    {actor.displayName?.charAt(0)?.toUpperCase() || "F"}
                  </Text>
                )}
              </View>

              <View style={styles.authorMeta}>
                <View style={styles.authorNameRow}>
                  <Text
                    style={[
                      styles.authorName,
                      { color: isDark ? "#fafafa" : "#09090b" },
                    ]}
                    numberOfLines={1}
                  >
                    {actor.displayName}
                  </Text>
                  {actor.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={12}
                      color={PRIMARY}
                      style={{ marginLeft: 3, marginRight: 4 }}
                    />
                  )}
                  {actor.badgeText && (
                    <View
                      style={[
                        styles.fellowBadge,
                        { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
                        actor.type === "team" && {
                          backgroundColor: isDark ? "rgba(59, 130, 246, 0.16)" : "#eff6ff",
                          borderColor: "#3b82f6",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.fellowBadgeText,
                          { color: isDark ? "#d4d4d8" : "#52525b" },
                          actor.type === "team" && { color: "#3b82f6" },
                        ]}
                      >
                        {actor.badgeText}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.metaSubRow}>
                  <Text
                    style={[
                      styles.authorDate,
                      { color: isDark ? "#a1a1aa" : "#71717a" },
                    ]}
                  >
                    {formatDate(item.date)}
                  </Text>
                  <Text
                    style={[
                      styles.authorDot,
                      { color: isDark ? "#71717a" : "#a1a1aa" },
                    ]}
                  >
                    ·
                  </Text>
                  <Text
                    style={[
                      styles.readTimeText,
                      { color: isDark ? "#a1a1aa" : "#71717a" },
                    ]}
                  >
                    {item.duration || "4 min read"}
                  </Text>
                  {isRead && (
                    <>
                      <Text
                        style={[
                          styles.authorDot,
                          { color: isDark ? "#71717a" : "#a1a1aa" },
                        ]}
                      >
                        ·
                      </Text>
                      <View style={styles.readBadge}>
                        <Ionicons name="checkmark-done" size={12} color="#10b981" />
                        <Text style={styles.readText}>Read</Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Bookmark button */}
            <Pressable
              hitSlop={12}
              android_ripple={{
                color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
                borderless: true,
                radius: 18,
              }}
              style={styles.actionIconButton}
              onPress={(e) => {
                e.stopPropagation();
                onToggleSave();
              }}
            >
              <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={
                  isSaved
                    ? isDark
                      ? "#ffffff"
                      : "#000000"
                    : isDark
                      ? "#71717a"
                      : "#a1a1aa"
                }
              />
            </Pressable>
          </View>

          {/* Headline & Abstract snippet */}
          <Text
            style={[
              styles.articleTitle,
              { color: isDark ? "#fafafa" : "#09090b" },
            ]}
          >
            {item.title}
          </Text>
          {item.caption ? (
            <Text
              style={[
                styles.articleCaption,
                { color: isDark ? "#a1a1aa" : "#52525b" },
              ]}
              numberOfLines={2}
            >
              {item.caption}
            </Text>
          ) : null}

          {/* Clean 16:9 Editorial Cover Image */}
          {item.image ? (
            <View
              style={[
                styles.imageWrapper,
                { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
              ]}
            >
              <ExpoImage
                source={{ uri: item.image }}
                style={styles.cardImage}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={200}
              />
              {item.type === "voice" && (
                <View style={styles.typeBadge}>
                  <Ionicons name="musical-notes" size={12} color="#ffffff" />
                  <Text style={styles.typeBadgeText}>
                    Voice & Caption · {formatDuration(item)}
                  </Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Article Footer: "Read Article" / "Listen & Read" action button + metrics & share */}
          <View
            style={[
              styles.articleFooter,
              { borderTopColor: isDark ? "#27272a" : "#f4f4f5" },
            ]}
          >
            {/* Direct Call to Action */}
            <View
              style={[
                styles.readButton,
                { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
              ]}
            >
              <Text
                style={[
                  styles.readButtonText,
                  { color: isDark ? "#ffffff" : "#000000" },
                ]}
              >
                {item.type === "voice" ? "Listen & Read" : "Read Article"}
              </Text>
              <Ionicons
                name={item.type === "voice" ? "play" : "arrow-forward"}
                size={item.type === "voice" ? 11 : 14}
                color={isDark ? "#ffffff" : "#000000"}
              />
            </View>

            {/* Right side stats: views, likes, and share */}
            <View style={styles.footerRightActions}>
              <View style={styles.footerStat}>
                <Ionicons
                  name="eye-outline"
                  size={14}
                  color={isDark ? "#71717a" : "#a1a1aa"}
                />
                <Text
                  style={[
                    styles.footerStatText,
                    { color: isDark ? "#a1a1aa" : "#71717a" },
                  ]}
                >
                  {item.views > 999
                    ? `${(item.views / 1000).toFixed(1)}k`
                    : item.views || 0}
                </Text>
              </View>

              <View style={styles.footerStat}>
                <Ionicons
                  name="heart-outline"
                  size={14}
                  color={isDark ? "#71717a" : "#a1a1aa"}
                />
                <Text
                  style={[
                    styles.footerStatText,
                    { color: isDark ? "#a1a1aa" : "#71717a" },
                  ]}
                >
                  {item.likes || 0}
                </Text>
              </View>

              <Pressable
                hitSlop={10}
                android_ripple={{
                  color: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
                  borderless: true,
                  radius: 16,
                }}
                style={styles.footerShareButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
              >
                <Ionicons
                  name="share-outline"
                  size={16}
                  color={isDark ? "#a1a1aa" : "#71717a"}
                />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </View>
    );
  },
);
MinimalDevotionCard.displayName = "MinimalDevotionCard";

const TAB_ROUTES = [
  { key: "all", title: "All" },
  { key: "saved", title: "Saved" },
];

export default function Devotions() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();
  const { width: viewportWidth } = useWindowDimensions();
  const [tabIndex, setTabIndex] = useState(0);

  const {
    devotionsList,
    setDevotionsList,
    saveDevotion,
    unsaveDevotion,
    isDevotionSaved,
    savedDevotions,
    isDevotionRead,
  } = useDevotionsStore();

  const initialDevotions = useMemo(() => {
    if (devotionsList && devotionsList.length > 0) return devotionsList;
    return OFFLINE_DEVOTIONS;
  }, [devotionsList]);

  const [devotions, setDevotions] = useState<Devotion[]>(initialDevotions);
  const [loading, setLoading] = useState(devotions.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [writerModalVisible, setWriterModalVisible] = useState(false);
  const [myWriterRequest, setMyWriterRequest] = useState<WriterRequest | null>(null);

  // Sync devotions from store whenever devotionsList updates
  useEffect(() => {
    if (devotionsList && devotionsList.length > 0) {
      setDevotions(devotionsList);
    }
  }, [devotionsList]);

  const canCreateDevotion = Boolean(
    __DEV__ ||
    isAdmin ||
    myWriterRequest?.status === "approved"
  );

  // Responsive card sizing: shows ~1.7 cards on phones and ~3 on tablets
  const cardWidth = useMemo(() => {
    const columns = viewportWidth >= 700 ? 3.15 : 1.72;
    const available = viewportWidth - 44; // page padding + card gap
    return Math.round(Math.min(280, Math.max(168, available / columns)));
  }, [viewportWidth]);
  const cardImageHeight = Math.round(cardWidth * 0.88);

  useEffect(() => {
    devotionWriterService.getMyApplication().then((res) => {
      if (res) setMyWriterRequest(res);
    }).catch(() => {});
  }, []);

  const requestIdRef = useRef(0);

  const fetchDevotions = useCallback(async (isRefresh = false) => {
    const requestId = ++requestIdRef.current;
    if (isRefresh) setRefreshing(true);
    else if (devotions.length === 0) setLoading(true);

    try {
      const response = await devotionsService.getDevotions();
      // Ignore responses that arrive after a newer request
      if (requestId !== requestIdRef.current) return;
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        setDevotions(response.data);
        setDevotionsList(response.data);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.log("Error or offline fetching devotions; retaining offline devotions:", error);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [devotions.length, setDevotionsList]);

  useEffect(() => {
    fetchDevotions();
  }, [fetchDevotions]);

  const onRefresh = useCallback(() => {
    fetchDevotions(true);
  }, [fetchDevotions]);

  // Native TabView drives the indicator, so taps only need to update the index.
  const handleTabChange = useCallback((index: number) => {
    if (index === tabIndex) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setTabIndex(index);
  }, [tabIndex]);

  const handleToggleSave = useCallback(
    (item: Devotion) => {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      if (isDevotionSaved(item._id)) {
        unsaveDevotion(item._id);
      } else {
        saveDevotion(item);
      }
    },
    [isDevotionSaved, saveDevotion, unsaveDevotion],
  );

  const handleShare = useCallback(async (item: Devotion) => {
    try {
      await Share.share({
        message: `Check out this devotion: ${item.title} by ${item.author}\n\nRead more on My Fellow app!`,
        url: item.image,
      });
    } catch (error) {
      console.log("Error sharing:", error);
    }
  }, []);

  const handleAuthorPress = useCallback((item?: Devotion) => {
    if (!item) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigateToDevotionAuthor(item, router);
  }, []);

  const latestDevotion = useMemo(() => (devotions.length > 0 ? devotions[0] : null), [devotions]);
  const recentDevotions = useMemo(() => devotions.slice(1, 7), [devotions]);
  const popularDevotions = useMemo(
    () =>
      [...devotions]
        .sort((a, b) => (b.views || 0) + (b.likes || 0) * 2 - ((a.views || 0) + (a.likes || 0) * 2))
        .slice(0, 6),
    [devotions],
  );

  const renderSavedItem = useCallback(
    ({ item }: { item: Devotion }) => (
      <MinimalDevotionCard
        item={item}
        isSaved={isDevotionSaved(item._id)}
        isRead={isDevotionRead(item._id)}
        isDark={isDark}
        onPress={() => router.push(`/devotion/${item._id}`)}
        onAuthorPress={() => handleAuthorPress(item)}
        onToggleSave={() => handleToggleSave(item)}
        onShare={() => handleShare(item)}
      />
    ),
    [isDevotionSaved, isDevotionRead, isDark, handleToggleSave, handleShare, handleAuthorPress],
  );

  const savedEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <View
          style={[
            styles.emptyIconCircle,
            { backgroundColor: isDark ? "#18181b" : "#f4f4f5" },
          ]}
        >
          <Ionicons
            name="bookmark-outline"
            size={36}
            color={isDark ? "#71717a" : "#a1a1aa"}
          />
        </View>
        <Text
          style={[
            styles.emptyTitle,
            { color: isDark ? "#fafafa" : "#09090b" },
          ]}
        >
          No saved devotions
        </Text>
        <Text
          style={[
            styles.emptySubtitle,
            { color: isDark ? "#a1a1aa" : "#71717a" },
          ]}
        >
          Tap the bookmark icon on any devotion to save it here for later.
        </Text>
      </View>
    ),
    [isDark],
  );

  const renderAllEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconCircle,
          { backgroundColor: isDark ? "#18181b" : "#f4f4f5" },
        ]}
      >
        <Ionicons
          name="document-text-outline"
          size={36}
          color={isDark ? "#71717a" : "#a1a1aa"}
        />
      </View>
      <Text
        style={[
          styles.emptyTitle,
          { color: isDark ? "#fafafa" : "#09090b" },
        ]}
      >
        No devotions found
      </Text>
      <Text
        style={[
          styles.emptySubtitle,
          { color: isDark ? "#a1a1aa" : "#71717a" },
        ]}
      >
        Check back later for newly published devotions.
      </Text>
    </View>
  );

  /* ── Page 0: All Devotions (Editorial Magazine / Native Hub) ── */
  const allScene = (
    <View style={styles.page}>
      {loading && devotions.length === 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollPageContent}
        >
          {/* Hero Banner skeleton */}
          <View
            style={[
              styles.heroOuter,
              {
                backgroundColor: isDark ? "#18181b" : "#ffffff",
                borderColor: isDark ? "#27272a" : "#eff3f4",
              },
            ]}
          >
            <Placeholder width="100%" height={180} borderRadius={0} />
            <View style={styles.heroContent}>
              <Placeholder width="85%" height={20} borderRadius={6} style={{ marginBottom: 8 }} />
              <Placeholder width="55%" height={16} borderRadius={6} style={{ marginBottom: 14 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Placeholder width={22} height={22} borderRadius={11} />
                  <Placeholder width={90} height={14} borderRadius={6} />
                </View>
                <Placeholder width={60} height={26} borderRadius={8} />
              </View>
            </View>
          </View>

          {/* Recent Carousel skeleton */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Placeholder width={140} height={20} borderRadius={6} />
            </View>
            <View style={[styles.horizontalScrollContent, { flexDirection: "row" }]}>
              {[0, 1, 2].map((i) => (
                <View key={`skel-card-${i}`} style={{ width: cardWidth }}>
                  <Placeholder
                    width={cardWidth}
                    height={cardImageHeight}
                    borderRadius={16}
                    style={{ marginBottom: 8 }}
                  />
                  <Placeholder width="90%" height={15} borderRadius={4} style={{ marginBottom: 6 }} />
                  <Placeholder width="60%" height={13} borderRadius={4} />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : devotions.length === 0 ? (
        renderAllEmptyState()
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollPageContent}
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
          {/* 1. LATEST DEVOTION HERO (Top) */}
          {latestDevotion && (
            <View
              style={[
                styles.heroOuter,
                {
                  backgroundColor: isDark ? "#18181b" : "#ffffff",
                  borderColor: isDark ? "#27272a" : "#eff3f4",
                },
              ]}
            >
              <Pressable
                android_ripple={{
                  color: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.04)",
                  foreground: true,
                }}
                style={({ pressed }) => [
                  styles.heroPressable,
                  Platform.OS === "ios" && pressed && { opacity: 0.94 },
                ]}
                onPress={() => router.push(`/devotion/${latestDevotion._id}`)}
              >
                {/* Clean Image with only LATEST badge on it */}
                <View
                  style={[
                    styles.heroImageContainer,
                    { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
                  ]}
                >
                  {latestDevotion.image ? (
                    <ExpoImage
                      source={{ uri: latestDevotion.image }}
                      style={styles.heroImage}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={200}
                    />
                  ) : (
                    <View style={styles.heroFallbackBg} />
                  )}
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>LATEST</Text>
                  </View>
                </View>

                {/* Content below image */}
                <View style={styles.heroContent}>
                  <Text
                    style={[
                      styles.heroTitle,
                      { color: isDark ? "#fafafa" : "#09090b" },
                    ]}
                    numberOfLines={2}
                  >
                    {latestDevotion.title}
                  </Text>

                  <View style={styles.heroFooter}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleAuthorPress(latestDevotion);
                      }}
                      style={styles.heroAuthorRow}
                    >
                      <View
                        style={[
                          styles.heroAuthorAvatar,
                          {
                            backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                            borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                          },
                        ]}
                      >
                        {latestDevotion.authorAvatar ? (
                          <ExpoImage
                            source={{ uri: latestDevotion.authorAvatar }}
                            style={{ width: "100%", height: "100%", borderRadius: 10 }}
                            contentFit="cover"
                          />
                        ) : (
                          <Text
                            style={[
                              styles.heroAuthorAvatarText,
                              { color: isDark ? "#e4e4e7" : "#3f3f46" },
                            ]}
                          >
                            {latestDevotion.author?.charAt(0)?.toUpperCase() || "F"}
                          </Text>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.heroAuthor,
                          { color: isDark ? "#d4d4d8" : "#3f3f46" },
                        ]}
                        numberOfLines={1}
                      >
                        {latestDevotion.author || "4 Kilo Fellowship"}
                      </Text>
                      <Ionicons
                        name="checkmark-circle"
                        size={11}
                        color={PRIMARY}
                        style={{ marginLeft: 3 }}
                      />
                      <Text style={styles.heroDot}>·</Text>
                      <Text
                        style={[
                          styles.heroDate,
                          { color: isDark ? "#a1a1aa" : "#71717a" },
                        ]}
                      >
                        {formatDate(latestDevotion.date)}
                      </Text>
                    </TouchableOpacity>

                    <View
                      style={[
                        styles.heroButton,
                        { backgroundColor: isDark ? "#27272a" : "#f4f4f5" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.heroButtonText,
                          { color: isDark ? "#ffffff" : "#000000" },
                        ]}
                      >
                        Read
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={12}
                        color={isDark ? "#ffffff" : "#000000"}
                      />
                    </View>
                  </View>
                </View>
              </Pressable>
            </View>
          )}

          {/* 2. RECENT DEVOTIONS (Horizontal Scroll) */}
          {recentDevotions.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? "#fafafa" : "#09090b" },
                  ]}
                >
                  Recent Devotions
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
                nestedScrollEnabled={true}
                overScrollMode="never"
                keyboardShouldPersistTaps="handled"
              >
                {recentDevotions.map((item: Devotion) => (
                  <CompactArticleCard
                    key={`recent-${item._id}`}
                    item={item}
                    isSaved={isDevotionSaved(item._id)}
                    isDark={isDark}
                    width={cardWidth}
                    imageHeight={cardImageHeight}
                    onPress={() => router.push(`/devotion/${item._id}`)}
                    onToggleSave={() => handleToggleSave(item)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* 3. POPULAR DEVOTIONS (Horizontal Scroll / Grid) */}
          {popularDevotions.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? "#fafafa" : "#09090b" },
                  ]}
                >
                  Popular Devotions
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScrollContent}
                nestedScrollEnabled={true}
                overScrollMode="never"
              >
                {popularDevotions.map((item: Devotion) => (
                  <CompactArticleCard
                    key={`popular-${item._id}`}
                    item={item}
                    isSaved={isDevotionSaved(item._id)}
                    isDark={isDark}
                    width={cardWidth}
                    imageHeight={cardImageHeight}
                    onPress={() => router.push(`/devotion/${item._id}`)}
                    onToggleSave={() => handleToggleSave(item)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* 4. ALL DEVOTIONS (Full Vertical Feed) */}
          {devotions.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDark ? "#fafafa" : "#09090b" },
                  ]}
                >
                  All Devotions
                </Text>
              </View>
              {devotions.map((item: Devotion) => (
                <MinimalDevotionCard
                  key={`all-feed-${item._id}`}
                  item={item}
                  isSaved={isDevotionSaved(item._id)}
                  isRead={isDevotionRead(item._id)}
                  isDark={isDark}
                  onPress={() => router.push(`/devotion/${item._id}`)}
                  onAuthorPress={() => handleAuthorPress(item)}
                  onToggleSave={() => handleToggleSave(item)}
                  onShare={() => handleShare(item)}
                />
              ))}
            </View>
          )}

          {/* 5. CTA: Apply to Write */}
          <View style={styles.ctaContainer}>
            <View style={styles.ctaIconCircle}>
              <Ionicons name="create-outline" size={22} color={PRIMARY} />
            </View>
            <Text
              style={[
                styles.ctaTitle,
                { color: isDark ? "#fafafa" : "#09090b" },
              ]}
            >
              Want to Share Your Faith?
            </Text>
            <Text
              style={[
                styles.ctaSubtitle,
                { color: isDark ? "#a1a1aa" : "#71717a" },
              ]}
            >
              Share your devotional insights and encourage the fellowship
              community through writing.
            </Text>

            <View style={styles.ctaButtonWrapper}>
              <Pressable
                onPress={() => {
                  try {
                    Haptics.selectionAsync();
                  } catch {}
                  setWriterModalVisible(true);
                }}
                android_ripple={{
                  color: "rgba(255, 255, 255, 0.28)",
                  borderless: false,
                  foreground: true,
                }}
                style={styles.ctaButtonInner}
              >
                <View style={styles.ctaButtonContent}>
                  <Text
                    numberOfLines={1}
                    style={styles.ctaButtonText}
                  >
                    {myWriterRequest?.status === "pending"
                      ? "Application Pending"
                      : myWriterRequest?.status === "approved"
                      ? "Writer Status Active"
                      : "Apply to Write"}
                  </Text>
                  <Ionicons
                    name={
                      myWriterRequest?.status === "pending"
                        ? "time-outline"
                        : myWriterRequest?.status === "approved"
                        ? "checkmark-circle-outline"
                        : "create-outline"
                    }
                    size={17}
                    color="#ffffff"
                    style={{ flexShrink: 0 }}
                  />
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );

  /* ── Page 1: Saved Bookmarks ── */
  const savedScene = (
    <View style={styles.page}>
      <FlatList
        data={savedDevotions}
        keyExtractor={(item) => item._id}
        renderItem={renderSavedItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
        ListEmptyComponent={savedEmptyComponent}
      />
    </View>
  );

  const renderTabLabel = ({
    route,
    color,
    focused,
  }: {
    route: Route;
    color: string;
    focused: boolean;
  }) => (
    <View style={styles.tabLabelRow}>
      <Text
        numberOfLines={1}
        style={[
          styles.tabLabelText,
          { color },
          focused && styles.tabLabelActive,
        ]}
      >
        {route.title}
      </Text>
      {route.key === "saved" && savedDevotions.length > 0 && (
        <View
          style={[
            styles.tabBadge,
            {
              backgroundColor: focused
                ? isDark
                  ? "#ffffff"
                  : "#000000"
                : isDark
                  ? "#27272a"
                  : "#f4f4f5",
            },
          ]}
        >
          <Text
            style={[
              styles.tabBadgeText,
              {
                color: focused
                  ? isDark
                    ? "#000000"
                    : "#ffffff"
                  : isDark
                    ? "#a1a1aa"
                    : "#71717a",
              },
            ]}
          >
            {savedDevotions.length}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.screenContainer,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Main Tab Header with "Devotions" in the center and live Streak badge */}
      <MainTabHeader
        borderBottom={true}
        title="Devotions"
        showStreak={true}
      />

      {/* 2 Tabs: All / Saved */}
      <TabView
        navigationState={{ index: tabIndex, routes: TAB_ROUTES }}
        onIndexChange={handleTabChange}
        renderScene={({ route }) => {
          switch (route.key) {
            case "saved":
              return savedScene;
            default:
              return allScene;
          }
        }}
        initialLayout={{ width: viewportWidth }}
        lazy
        lazyPreloadDistance={1}
        renderTabBar={(tabBarProps) => (
          <TabBar
            {...tabBarProps}
            indicatorStyle={[
              styles.tabIndicator,
              { backgroundColor: isDark ? "#ffffff" : "#000000" },
            ]}
            style={[
              styles.tabBar,
              {
                backgroundColor: isDark ? "#000000" : "#ffffff",
                borderBottomColor: isDark ? "#27272a" : "#eff3f4",
              },
            ]}
            tabStyle={styles.tabItem}
            activeColor={isDark ? "#ffffff" : "#000000"}
            inactiveColor={isDark ? "#a1a1aa" : "#71717a"}
            pressColor={
              isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"
            }
            scrollEnabled={false}
            options={{
              all: { label: renderTabLabel },
              saved: { label: renderTabLabel },
            }}
          />
        )}
      />

      {/* Floating Action Button (+) — Admin & Approved Writers for Devotion Creation */}
      {canCreateDevotion && (
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            router.push("/devotion/manage");
          }}
          accessibilityRole="button"
          accessibilityLabel="Create Devotion"
          style={[
            styles.fabBtn,
            {
              backgroundColor: PRIMARY,
              bottom: 60 + Math.max(insets.bottom, 6) + 16,
            },
          ]}
        >
          <Ionicons name="add" size={32} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Devotion Writer Application Modal */}
      <DevotionWriterModal
        visible={writerModalVisible}
        onClose={() => setWriterModalVisible(false)}
        existingRequest={myWriterRequest}
        onSuccess={(newReq) => setMyWriterRequest(newReq)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
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
    zIndex: 99,
  },
  // Tab Bar (native TabView indicator, finger-tracked by the pager)
  tabBar: {
    backgroundColor: "#ffffff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eff3f4",
    elevation: 0,
    shadowOpacity: 0,
  },
  tabItem: {
    minHeight: 46,
    paddingHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  tabIndicator: {
    backgroundColor: "#000000",
    height: 2.5,
    borderRadius: 2,
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    minWidth: 64,
  },
  tabLabelText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
    includeFontPadding: false,
    textAlign: "center",
  },
  tabLabelActive: {
    fontWeight: "700",
  },
  tabBadge: {
    marginLeft: 6,
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 9999,
  },
  tabBadgeActive: {
    backgroundColor: "#000000",
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#71717a",
  },
  tabBadgeTextActive: {
    color: "#ffffff",
  },
  // Pager & List
  page: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 96,
  },
  scrollPageContent: {
    paddingBottom: 240,
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // 1. Hero Banner (Latest Devotion)
  heroOuter: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eff3f4",
    overflow: "hidden",
  },
  heroPressable: {
    width: "100%",
  },
  heroImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
    backgroundColor: "#f4f4f5",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroFallbackBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#18181b",
  },
  heroBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: PRIMARY,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heroBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroContent: {
    padding: 14,
  },
  heroTitle: {
    color: "#09090b",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 23,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  heroFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroAuthorRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  heroAuthorAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  heroAuthorAvatarText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#3f3f46",
  },
  heroAuthor: {
    color: "#3f3f46",
    fontSize: 12,
    fontWeight: "600",
    maxWidth: 130,
  },
  heroDot: {
    fontSize: 12,
    color: "#a1a1aa",
    marginHorizontal: 5,
  },
  heroDate: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "500",
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  heroButtonText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
    marginRight: 4,
  },
  // Section Headers
  sectionContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#09090b",
    letterSpacing: -0.3,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 8,
  },
  // Compact Video / Devotional Card (Matching user reference UI)
  compactCardOuter: {
    overflow: "visible",
  },
  compactCardPressable: {
    width: "100%",
  },
  compactImageWrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#e4e4e7",
  },
  compactImage: {
    width: "100%",
    height: "100%",
  },
  compactImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f5",
  },
  compactImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: "rgba(0, 0, 0, 0.22)",
  },
  compactNewBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#8da672",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  compactNewText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  compactVoiceBadge: {
    position: "absolute",
    bottom: 9,
    left: 9,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  compactVoiceText: {
    color: "#ffffff",
    fontSize: 10.5,
    fontWeight: "700",
  },
  compactDurationBadge: {
    position: "absolute",
    bottom: 9,
    left: 9,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  compactDurationText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  compactBody: {
    width: "100%",
    paddingTop: 8,
    paddingHorizontal: 2,
  },
  compactTitle: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#18181b",
    lineHeight: 19,
    marginBottom: 4,
    minHeight: 38,
  },
  compactAuthor: {
    flex: 1,
    fontSize: 13,
    color: "#71717a",
    fontWeight: "500",
    marginRight: 8,
  },
  compactMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  compactMetaActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  compactViewsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  compactViewsText: {
    fontSize: 12,
    color: "#71717a",
    fontWeight: "500",
  },
  compactBookmarkBtn: {
    padding: 3,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  // Editorial Article-Style Card
  articleCardOuter: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#eff3f4",
    overflow: "hidden",
  },
  articleCardPressable: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e4e4e7",
  },
  authorAvatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#18181b",
  },
  authorMeta: {
    flex: 1,
    justifyContent: "center",
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#09090b",
    maxWidth: 160,
  },
  fellowBadge: {
    marginLeft: 6,
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  fellowBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#52525b",
    letterSpacing: -0.1,
  },
  metaSubRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorDot: {
    fontSize: 12,
    color: "#a1a1aa",
    marginHorizontal: 4,
  },
  authorDate: {
    fontSize: 12,
    color: "#71717a",
  },
  readTimeText: {
    fontSize: 12,
    color: "#71717a",
    fontWeight: "500",
  },
  readBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  readText: {
    fontSize: 11,
    color: "#10b981",
    fontWeight: "600",
    marginLeft: 2,
  },
  actionIconButton: {
    padding: 6,
    borderRadius: 16,
  },
  articleTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#09090b",
    lineHeight: 23,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  articleCaption: {
    fontSize: 13.5,
    color: "#52525b",
    lineHeight: 19,
    marginBottom: 12,
  },
  imageWrapper: {
    width: "100%",
    height: 165,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#f4f4f5",
    marginBottom: 14,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  typeBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
    marginLeft: 3,
  },
  articleFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#f4f4f5",
  },
  readButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4f4f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  readButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000000",
    marginRight: 4,
  },
  footerRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerStat: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  footerStatText: {
    fontSize: 12,
    color: "#71717a",
    marginLeft: 4,
    fontWeight: "500",
  },
  footerShareButton: {
    marginLeft: 14,
    padding: 4,
  },
  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f4f4f5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#09090b",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 18,
  },
  // CTA Section
  ctaContainer: {
    width: "100%",
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 44,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  ctaIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 103, 25, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#09090b",
    marginBottom: 6,
    textAlign: "center",
    letterSpacing: -0.2,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: "#71717a",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
    maxWidth: 290,
  },
  ctaButtonWrapper: {
    height: 42,
    minHeight: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    shadowColor: "#ff6719",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  ctaButtonInner: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  ctaButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaButtonText: {
    color: "#ffffff",
    fontSize: 13.5,
    fontWeight: "700",
    letterSpacing: 0.1,
    includeFontPadding: false,
    textAlign: "center",
  },
});
