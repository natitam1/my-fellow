import { AppBottomSheet } from "@/components/AppBottomSheet";
import { ImageViewerModal } from "@/components/ImageViewerModal";
import { MainTabHeader } from "@/components/MainTabHeader";
import { ProfileLink } from "@/components/profile/ProfileLink";
import { PRIMARY } from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";
import { useUserStore } from "@/stores/user.store";
import {
  CommunityPost,
  useCommunityStore,
} from "@/stores/community.store";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Route, TabBar, TabView } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SCREEN_WIDTH = Dimensions.get("window").width;

function CommunityFeedSkeleton({
  isDark,
  borderColor,
}: {
  isDark: boolean;
  borderColor: string;
}) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  const blockBg = isDark ? "#27272a" : "#e5e7eb";

  const cards = [
    { lines: ["94%", "78%"], hasMedia: false },
    { lines: ["90%", "62%"], hasMedia: true },
    { lines: ["96%", "82%", "52%"], hasMedia: false },
    { lines: ["88%", "70%"], hasMedia: false },
  ];

  return (
    <View style={styles.skeletonFeedContainer}>
      {cards.map((card, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.skeletonCard,
            {
              borderBottomColor: borderColor,
              opacity: pulseAnim,
            },
          ]}
        >
          {/* Left Avatar */}
          <View style={[styles.skeletonAvatar, { backgroundColor: blockBg }]} />

          {/* Right Body */}
          <View style={styles.skeletonBody}>
            {/* Header: Name, Handle, Time */}
            <View style={styles.skeletonHeaderRow}>
              <View
                style={[
                  styles.skeletonNameBar,
                  { backgroundColor: blockBg, width: idx % 2 === 0 ? 110 : 135 },
                ]}
              />
              <View style={[styles.skeletonHandleBar, { backgroundColor: blockBg }]} />
              <View style={[styles.skeletonTimeBar, { backgroundColor: blockBg }]} />
            </View>

            {/* Post Lines */}
            <View style={styles.skeletonLinesCol}>
              {card.lines.map((w, lIdx) => (
                <View
                  key={lIdx}
                  style={[
                    styles.skeletonLine,
                    { backgroundColor: blockBg, width: w as any },
                  ]}
                />
              ))}
            </View>

            {/* Media Image Box for photo tweets */}
            {card.hasMedia && (
              <View
                style={[
                  styles.skeletonMediaBox,
                  { backgroundColor: blockBg },
                ]}
              />
            )}

            {/* Bottom Part: Action Bar (Reply, Repost, Like, Bookmark) */}
            <View style={styles.skeletonActionBar}>
              <View style={styles.skeletonActionItem}>
                <View style={[styles.skeletonActionIcon, { backgroundColor: blockBg }]} />
                <View style={[styles.skeletonActionText, { backgroundColor: blockBg, width: 20 }]} />
              </View>

              <View style={styles.skeletonActionItem}>
                <View style={[styles.skeletonActionIcon, { backgroundColor: blockBg }]} />
                <View style={[styles.skeletonActionText, { backgroundColor: blockBg, width: 18 }]} />
              </View>

              <View style={styles.skeletonActionItem}>
                <View style={[styles.skeletonActionIcon, { backgroundColor: blockBg }]} />
                <View style={[styles.skeletonActionText, { backgroundColor: blockBg, width: 24 }]} />
              </View>

              <View style={styles.skeletonActionItem}>
                <View style={[styles.skeletonActionIcon, { backgroundColor: blockBg }]} />
              </View>
            </View>
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useUserStore();

  const posts = useCommunityStore((s) => s.posts);
  const forYouPosts = useCommunityStore((s) => s.forYouPosts);
  const followingPosts = useCommunityStore((s) => s.followingPosts);
  const isForYouLoading = useCommunityStore((s) => s.isForYouLoading);
  const isFollowingLoading = useCommunityStore((s) => s.isFollowingLoading);
  const hasMoreForYou = useCommunityStore((s) => s.hasMoreForYou);
  const hasMoreFollowing = useCommunityStore((s) => s.hasMoreFollowing);
  const feedType = useCommunityStore((s) => s.feedType);
  const setFeedType = useCommunityStore((s) => s.setFeedType);
  const fetchFeed = useCommunityStore((s) => s.fetchFeed);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const toggleBookmark = useCommunityStore((s) => s.toggleBookmark);
  const deletePost = useCommunityStore((s) => s.deletePost);

  const [activeTab, setActiveTab] = useState<0 | 1>(feedType === "following" ? 1 : 0);
  const [refreshingForYou, setRefreshingForYou] = useState<boolean>(false);
  const [refreshingFollowing, setRefreshingFollowing] = useState<boolean>(false);
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchFeed("foryou", true);
    fetchFeed("following", true);
  }, [fetchFeed]);

  // Three-dots bottom sheet state
  const [activePostForSheet, setActivePostForSheet] = useState<CommunityPost | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Fullscreen image viewer state
  const [lightboxImage, setLightboxImage] = useState<{
    uri: any;
    caption?: string;
    author?: string;
  } | null>(null);

  const onRefreshForYou = useCallback(async () => {
    setRefreshingForYou(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    await fetchFeed("foryou", true);
    setRefreshingForYou(false);
  }, [fetchFeed]);

  const onRefreshFollowing = useCallback(async () => {
    setRefreshingFollowing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    await fetchFeed("following", true);
    setRefreshingFollowing(false);
  }, [fetchFeed]);

  const handleTabChange = (index: number) => {
    const nextTab = index as 0 | 1;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    setActiveTab(nextTab);
    const type = nextTab === 0 ? "foryou" : "following";
    if (feedType !== type) {
      setFeedType(type);
      fetchFeed(type, false);
    }
  };

  const handleToggleLike = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    toggleLike(id);
  };

  const handleToggleBookmark = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    toggleBookmark(id);
  };

  const handleShare = async (post: CommunityPost) => {
    try {
      Haptics.selectionAsync().catch(() => {});
      await Share.share({
        message: `${post.content}\n\n— ${post.authorName} on 4 Kilo Fellowship\nmy-fellow://community/${post.id}`,
      });
    } catch {
      // ignore
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedPostIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const textColor = isDark ? "#e7e9ea" : "#0f1419";
  const mutedColor = isDark ? "#71767b" : "#536471";
  const borderColor = isDark ? "#2f3336" : "#eff3f4";
  const bg = isDark ? "#000000" : "#ffffff";
  const TWITTER_BLUE = "#1d9bf0";

  // Formatter for Twitter/X style metrics (e.g. 5, 72, 151, 7.1K, 88K)
  const formatActionCount = (count?: number) => {
    if (!count || count <= 0) return "";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return String(count);
  };

  // Formatter for Twitter/X compact relative time (e.g. "22h", "1h", "45m", "2d")
  const formatTwitterTime = (timeStr?: string) => {
    if (!timeStr) return "now";
    const cleaned = timeStr.replace(/\s*ago$/i, "").trim();
    if (cleaned.toLowerCase() === "just now") return "now";
    return cleaned;
  };

  // Helper to render styled tweet text with highlighted hashtags, mentions, and links
  const renderFormattedText = (text: string, isExpanded: boolean, postId: string) => {
    const isLong = text.length > 280;
    const displayText = isLong && !isExpanded ? text.slice(0, 280) + "..." : text;
    const words = displayText.split(/(\s+)/);

    return (
      <Text style={[styles.postText, { color: textColor }]}>
        {words.map((word, idx) => {
          if (
            word.startsWith("@") ||
            word.startsWith("#") ||
            word.startsWith("http") ||
            word.startsWith("youtu.be") ||
            /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?$/.test(word)
          ) {
            return (
              <Text key={idx} style={{ color: TWITTER_BLUE }}>
                {word}
              </Text>
            );
          }
          return word;
        })}
        {isLong && (
          <Text
            onPress={() => toggleExpand(postId)}
            style={{ color: TWITTER_BLUE, fontWeight: "600" }}
          >
            {isExpanded ? " Show less" : " Show more"}
          </Text>
        )}
      </Text>
    );
  };

  const feedRoutes: Route[] = [
    { key: "foryou", title: "For you" },
    { key: "following", title: "Following" },
  ];

  const renderPostItem = ({ item }: { item: CommunityPost }) => {
    const isExpanded = !!expandedPostIds[item.id];
    const formattedHandle = item.authorHandle
      ? (item.authorHandle.startsWith("@") ? item.authorHandle : `@${item.authorHandle}`)
      : `@${(item.authorName || "fellow").toLowerCase().replace(/[^a-z0-9]/g, "") || "fellow"}`;
    const displayTime = formatTwitterTime(item.timestamp);
    const replyCountStr = formatActionCount(item.repliesCount);
    const likeCountStr = formatActionCount(item.likesCount);

    return (
      <View
        style={[
          styles.tweetRow,
          {
            borderBottomColor: borderColor,
          },
        ]}
      >
        {/* Left Column: Author Avatar -> Navigates to Member Profile */}
        <View style={styles.tweetAvatarWrap}>
          <ProfileLink
            user={{
              id: item.authorId || "user-fellowship",
              name: item.authorName,
              username: item.authorHandle,
              avatarUrl: item.authorAvatar,
              team: item.authorTeam,
            }}
            size={40}
          />
        </View>

        {/* Right Column: Tweet Content & Actions */}
        <View style={styles.tweetBodyCol}>
          {/* Header: Author Name, Verified Badge, Handle, Middot, Time, Vertical Three-dots */}
          <View style={styles.tweetHeaderRow}>
            <ProfileLink
              user={{
                id: item.authorId || "user-fellowship",
                name: item.authorName,
                username: item.authorHandle,
                avatarUrl: item.authorAvatar,
                team: item.authorTeam,
              }}
              showAvatar={false}
              style={styles.tweetAuthorInfo}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.tweetAuthorName,
                  { color: isDark ? "#f7f9f9" : "#0f1419" },
                ]}
              >
                {item.authorName}
              </Text>

              {item.isVerified && (
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color={PRIMARY}
                  style={styles.verifiedBadge}
                />
              )}

              {item.authorTeam === "Official Fellowship" && (
                <View
                  style={[
                    styles.officialMiniBadge,
                    {
                      backgroundColor: isDark
                        ? "rgba(255, 103, 25, 0.18)"
                        : "rgba(255, 103, 25, 0.1)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.officialMiniBadgeText,
                      { color: PRIMARY },
                    ]}
                  >
                    Official
                  </Text>
                </View>
              )}

              <Text
                numberOfLines={1}
                style={[styles.tweetHandle, { color: mutedColor }]}
              >
                {formattedHandle}
              </Text>

              <Text style={[styles.tweetMiddot, { color: mutedColor }]}>
                ·
              </Text>

              <Text style={[styles.tweetTime, { color: mutedColor }]}>
                {displayTime}
              </Text>
            </ProfileLink>

            {/* Vertical Three-dots Menu Trigger (matching Twitter/X screenshot) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Post options"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                setActivePostForSheet(item);
                setSheetVisible(true);
              }}
              hitSlop={8}
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.16)" : "rgba(0, 0, 0, 0.10)",
                borderless: true,
                radius: 16,
              }}
              style={({ pressed }) => [
                styles.tweetMoreBtn,
                {
                  opacity: pressed ? (Platform.OS === "ios" ? 0.6 : 0.85) : 1,
                  transform: Platform.OS === "ios" && pressed ? [{ scale: 0.94 }] : undefined,
                },
              ]}
            >
              <Ionicons
                name="ellipsis-vertical"
                size={16}
                color={mutedColor}
              />
            </Pressable>
          </View>

          {/* Body Content -> Navigates to Post Details */}
          <TouchableOpacity
            activeOpacity={0.96}
            onPress={() => {
              router.push(`/community/${item.id}` as any);
            }}
            style={styles.tweetContentWrap}
          >
            {renderFormattedText(item.content, isExpanded, item.id)}
          </TouchableOpacity>

          {/* Attached Image -> Opens Lightbox */}
          {item.image && (
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() =>
                setLightboxImage({
                  uri: item.image,
                  caption: item.content,
                  author: item.authorName,
                })
              }
              style={[
                styles.tweetMediaCard,
                {
                  borderColor: isDark ? "#27272a" : "#e2e8f0",
                  backgroundColor: isDark ? "#18181b" : "#f8fafc",
                },
              ]}
            >
              <Image
                source={
                  typeof item.image === "string"
                    ? { uri: item.image }
                    : item.image
                }
                style={styles.tweetMediaImg}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Action Row: Reply, Like, Bookmark, Share (matching Twitter/X layout, NO repost, NO grok, NO views) */}
          <View style={styles.tweetActionBar}>
            {/* Reply / Comment */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push(`/community/${item.id}` as any);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.tweetActionBtn}
            >
              <Ionicons
                name="chatbubble-outline"
                size={17}
                color={mutedColor}
              />
              {replyCountStr ? (
                <Text
                  style={[styles.tweetActionCount, { color: mutedColor }]}
                >
                  {replyCountStr}
                </Text>
              ) : null}
            </TouchableOpacity>

            {/* Like */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleToggleLike(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.tweetActionBtn}
            >
              <Ionicons
                name={item.isLiked ? "heart" : "heart-outline"}
                size={18}
                color={item.isLiked ? "#f91880" : mutedColor}
              />
              {likeCountStr ? (
                <Text
                  style={[
                    styles.tweetActionCount,
                    {
                      color: item.isLiked ? "#f91880" : mutedColor,
                    },
                  ]}
                >
                  {likeCountStr}
                </Text>
              ) : null}
            </TouchableOpacity>

            {/* Bookmark */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleToggleBookmark(item.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.tweetActionBtn}
            >
              <Ionicons
                name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={18}
                color={item.isBookmarked ? TWITTER_BLUE : mutedColor}
              />
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleShare(item)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.tweetActionBtn}
            >
              <Ionicons
                name={Platform.OS === "ios" ? "share-outline" : "share-social-outline"}
                size={18}
                color={mutedColor}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderForYouScene = () => {
    return (
      <FlatList
        data={forYouPosts && forYouPosts.length > 0 ? forYouPosts : posts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          flexGrow: 1,
        }}
        onEndReached={() => {
          if (!isForYouLoading && hasMoreForYou) {
            fetchFeed("foryou", false);
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isForYouLoading && (forYouPosts?.length > 0 || posts.length > 0) ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator color={PRIMARY} size="small" />
            </View>
          ) : undefined}
        ListEmptyComponent={
          isForYouLoading ? (
            <CommunityFeedSkeleton isDark={isDark} borderColor={borderColor} />
          ) : (
            <View
              style={{
                paddingVertical: 60,
                alignItems: "center",
                paddingHorizontal: 32,
              }}
            >
              <Ionicons
                name="chatbubbles-outline"
                size={44}
                color={mutedColor}
              />
              <Text
                style={{
                  color: textColor,
                  fontSize: 16,
                  fontWeight: "600",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                No reflections yet
              </Text>
              <Text
                style={{
                  color: mutedColor,
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 6,
                  lineHeight: 18,
                }}
              >
                Be the first to share an encouragement or prayer with the fellowship!
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshingForYou}
            onRefresh={onRefreshForYou}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
        renderItem={renderPostItem}
      />
    );
  };

  const renderFollowingScene = () => {
    return (
      <FlatList
        data={followingPosts}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 100,
          flexGrow: 1,
        }}
        onEndReached={() => {
          if (!isFollowingLoading && hasMoreFollowing) {
            fetchFeed("following", false);
          }
        }}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFollowingLoading && followingPosts?.length > 0 ? (
            <View style={{ paddingVertical: 20, alignItems: "center" }}>
              <ActivityIndicator color={PRIMARY} size="small" />
            </View>
          ) : undefined}
        ListEmptyComponent={
          isFollowingLoading ? (
            <CommunityFeedSkeleton isDark={isDark} borderColor={borderColor} />
          ) : (
            <View
              style={{
                paddingVertical: 60,
                alignItems: "center",
                paddingHorizontal: 32,
              }}
            >
              <Ionicons
                name="people-outline"
                size={44}
                color={mutedColor}
              />
              <Text
                style={{
                  color: textColor,
                  fontSize: 16,
                  fontWeight: "600",
                  marginTop: 12,
                  textAlign: "center",
                }}
              >
                No reflections from connects yet
              </Text>
              <Text
                style={{
                  color: mutedColor,
                  fontSize: 13,
                  textAlign: "center",
                  marginTop: 6,
                  lineHeight: 18,
                }}
              >
                Follow fellow students to see their campus prayers and reflections here.
              </Text>
            </View>
          )}
        refreshControl={
          <RefreshControl
            refreshing={refreshingFollowing}
            onRefresh={onRefreshFollowing}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
        renderItem={renderPostItem}
      />
    );
  };

  const renderCommunityScene = ({ route }: { route: Route }) =>
    route.key === "foryou" ? renderForYouScene() : renderFollowingScene();

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Main Tab Header */}
      <MainTabHeader borderBottom={false} />

      {/* Feed Tabs: For you / Following - smooth animated TabView (AI Poster Studio style) */}
      <TabView
        navigationState={{ index: activeTab, routes: feedRoutes }}
        renderScene={renderCommunityScene}
        onIndexChange={handleTabChange}
        initialLayout={{ width: SCREEN_WIDTH }}
        lazy
        lazyPreloadDistance={1}
        commonOptions={{
          labelStyle: {
            fontSize: 15,
            fontWeight: "700",
            letterSpacing: -0.2,
            textTransform: "none",
          },
        }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{
              backgroundColor: PRIMARY,
              height: 3,
              borderRadius: 1.5,
            }}
            style={{
              backgroundColor: bg,
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: borderColor,
              elevation: 0,
              shadowOpacity: 0,
            }}
            activeColor={PRIMARY}
            inactiveColor={mutedColor}
            pressColor={isDark ? "rgba(255, 103, 25, 0.12)" : "rgba(255, 103, 25, 0.08)"}
          />
        )}
      />

      {/* Floating Action Button (+) — Floats cleanly above the bottom navigation tab bar (Twitter/X style) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create post"
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
          router.push("/community/compose");
        }}
        android_ripple={{
          color: "rgba(255, 255, 255, 0.3)",
          borderless: true,
          radius: 28,
        }}
        style={({ pressed }) => [
          styles.fabBtn,
          {
            backgroundColor: PRIMARY,
            bottom: 60 + Math.max(insets.bottom, 6) + 16,
            opacity: pressed && Platform.OS === "ios" ? 0.88 : 1,
            transform: pressed && Platform.OS === "ios" ? [{ scale: 0.94 }] : undefined,
          },
        ]}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </Pressable>

      {/* Three-dots Actions Native Bottom Sheet */}
      <AppBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        isDark={isDark}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHandle} />

          {activePostForSheet && (
            <View style={styles.sheetHeader}>
              <Text numberOfLines={1} style={[styles.sheetPostAuthor, { color: textColor }]}>
                {activePostForSheet.authorName}’s Post
              </Text>
              <Text numberOfLines={1} style={[styles.sheetSnippet, { color: mutedColor }]}>
                {activePostForSheet.content}
              </Text>
            </View>
          )}

          {/* Sheet Actions List */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSheetVisible(false);
              if (activePostForSheet) handleShare(activePostForSheet);
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#f1f5f9" }]}>
              <Ionicons name="share-social-outline" size={20} color={PRIMARY} />
            </View>
            <Text style={[styles.sheetActionLabel, { color: textColor }]}>Share post via...</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSheetVisible(false);
              if (activePostForSheet) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                Alert.alert("Link Copied", "Post link copied to clipboard!");
              }
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#f1f5f9" }]}>
              <Ionicons name="link-outline" size={20} color={PRIMARY} />
            </View>
            <Text style={[styles.sheetActionLabel, { color: textColor }]}>Copy link to post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSheetVisible(false);
              if (activePostForSheet) {
                router.push({
                  pathname: "/community/user/[id]",
                  params: {
                    id: activePostForSheet.authorId || "user-fellowship",
                    name: activePostForSheet.authorName,
                    username: activePostForSheet.authorHandle,
                    avatar:
                      typeof activePostForSheet.authorAvatar === "string"
                        ? activePostForSheet.authorAvatar
                        : "",
                  },
                } as any);
              }
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#f1f5f9" }]}>
              <Ionicons name="person-circle-outline" size={20} color={PRIMARY} />
            </View>
            <Text style={[styles.sheetActionLabel, { color: textColor }]}>View author profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              if (activePostForSheet) {
                handleToggleBookmark(activePostForSheet.id);
                setSheetVisible(false);
              }
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#f1f5f9" }]}>
              <Ionicons
                name={activePostForSheet?.isBookmarked ? "bookmark" : "bookmark-outline"}
                size={20}
                color={PRIMARY}
              />
            </View>
            <Text style={[styles.sheetActionLabel, { color: textColor }]}>
              {activePostForSheet?.isBookmarked ? "Remove from Bookmarks" : "Save to Bookmarks"}
            </Text>
          </TouchableOpacity>

          {/* Author Delete Option */}
          {activePostForSheet && (activePostForSheet.authorId === user?.id || !activePostForSheet.authorId) && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                const targetId = activePostForSheet.id;
                Alert.alert(
                  "Delete Post",
                  "Are you sure you want to delete this reflection? This cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        setSheetVisible(false);
                        try {
                          await deletePost(targetId);
                          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
                        } catch {
                          Alert.alert("Error", "Could not delete post. Please try again.");
                        }
                      },
                    },
                  ]
                );
              }}
              style={styles.sheetActionItem}
            >
              <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#fef2f2" }]}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </View>
              <Text style={[styles.sheetActionLabel, { color: "#ef4444", fontWeight: "600" }]}>
                Delete post
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setSheetVisible(false);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
              Alert.alert(
                "Report Submitted",
                "Thank you for notifying fellowship leaders. Our ministry team will review this shortly."
              );
            }}
            style={styles.sheetActionItem}
          >
            <View style={[styles.sheetActionIcon, { backgroundColor: isDark ? "#27272a" : "#fef2f2" }]}>
              <Ionicons name="flag-outline" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.sheetActionLabel, { color: "#ef4444" }]}>Report post to leaders</Text>
          </TouchableOpacity>
        </View>
      </AppBottomSheet>

      {/* Fullscreen Image Lightbox */}
      <ImageViewerModal
        visible={!!lightboxImage}
        imageUri={lightboxImage?.uri}
        caption={lightboxImage?.caption}
        authorName={lightboxImage?.author}
        onClose={() => setLightboxImage(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  skeletonFeedContainer: {
    width: "100%",
  },
  skeletonCard: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  skeletonBody: {
    flex: 1,
    gap: 10,
  },
  skeletonHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  skeletonNameBar: {
    height: 13,
    borderRadius: 6,
  },
  skeletonHandleBar: {
    width: 68,
    height: 11,
    borderRadius: 6,
  },
  skeletonTimeBar: {
    width: 32,
    height: 11,
    borderRadius: 6,
  },
  skeletonLinesCol: {
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },
  skeletonMediaBox: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginTop: 4,
  },
  skeletonActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingRight: 24,
  },
  skeletonActionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  skeletonActionIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  skeletonActionText: {
    height: 10,
    borderRadius: 5,
  },
  tweetRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tweetAvatarWrap: {
    marginRight: 10,
  },
  tweetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e2e8f0",
  },
  tweetBodyCol: {
    flex: 1,
  },
  tweetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tweetAuthorInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    marginRight: 6,
    overflow: "hidden",
  },
  tweetAuthorName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  verifiedBadge: {
    marginLeft: 3,
    marginRight: 1,
    flexShrink: 0,
  },
  officialMiniBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 4,
    flexShrink: 0,
  },
  officialMiniBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  tweetHandle: {
    fontSize: 15,
    marginLeft: 4,
    flexShrink: 2,
  },
  tweetMiddot: {
    marginHorizontal: 4,
    fontSize: 14,
    flexShrink: 0,
  },
  tweetTime: {
    fontSize: 15,
    flexShrink: 0,
  },
  tweetMoreBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tweetContentWrap: {
    marginTop: 4,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  tweetMediaCard: {
    marginTop: 10,
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  tweetMediaImg: {
    width: "100%",
    height: "100%",
  },
  tweetActionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    maxWidth: 340,
    paddingRight: 16,
  },
  tweetActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  tweetActionCount: {
    fontSize: 13,
    fontWeight: "400",
  },
  fabBtn: {
    position: "absolute",
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
    zIndex: 50,
  },
  sheetContainer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 8,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    paddingBottom: 14,
    marginBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  sheetPostAuthor: {
    fontSize: 16,
    fontWeight: "700",
  },
  sheetSnippet: {
    fontSize: 13,
    marginTop: 4,
  },
  sheetActionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 14,
  },
  sheetActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetActionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
});
