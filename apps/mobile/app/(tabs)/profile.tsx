import { ImageViewerModal } from "@/components/ImageViewerModal";
import { MainTabHeader } from "@/components/MainTabHeader";
import { ConfirmModal } from "@/components/Modals/ConfirmModal";
import { StreakModal } from "@/components/StreakModal";
import { LongPressAvatar, closeAvatarPreview } from "@/components/avatar-preview";
import { ProfileLink } from "@/components/profile/ProfileLink";
import { PRIMARY } from "@/constants";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import api from "@/services/api";
import { authService } from "@/services/authService";
import { socialApi } from "@/services/socialApi";
import {
  apiPostToCommunityPost,
  apiProfileToMemberProfile,
  CommunityPost,
  useCommunityStore,
} from "@/stores/community.store";
import { useProgramsStore } from "@/stores/programs.store";
import { useStreakStore } from "@/stores/streak.store";
import { useTeamsStore } from "@/stores/teams.store";
import { useUserStore } from "@/stores/user.store";
import { ProfileDetail } from "@/types/social.types";
import { getPrefilledAvatar } from "@/utils/avatar";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ProfileTabKey = "posts" | "media" | "ministry" | "likes" | "account";

interface ProfileTabItem {
  key: ProfileTabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PROFILE_TABS: ProfileTabItem[] = [
  { key: "posts", label: "Reflections", icon: "chatbubble-ellipses-outline" },
  { key: "media", label: "Media", icon: "images-outline" },
  { key: "ministry", label: "Ministry", icon: "flame-outline" },
  { key: "likes", label: "Likes", icon: "heart-outline" },
  { key: "account", label: "Account", icon: "person-circle-outline" },
];

function formatJoinedDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `Joined ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function extractMediaUrl(media?: any): string | null {
  if (!media) return null;
  if (typeof media === "string") return media;
  if (media.id === "default-cover") return null;
  return (
    media.urls?.original ||
    media.urls?.lg ||
    media.urls?.md ||
    media.urls?.sm ||
    media.uri ||
    null
  );
}

function isFallbackUnsplashBanner(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return (
    url.includes("photo-1541829070764-84a7d30dd3f3") ||
    url.includes("photo-1516450360452-9312f5e86fc7")
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { authState, logout, getCurrentUser } = useAuth();
  const { user, setUser } = useUserStore();
  const router = useRouter();

  const getCurrentUserRef = useRef(getCurrentUser);
  getCurrentUserRef.current = getCurrentUser;

  // Active Tab state
  const [activeTab, setActiveTab] = useState<ProfileTabKey>("posts");

  // Modals state
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [streakModalVisible, setStreakModalVisible] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{
    uri: string;
    caption?: string;
    author?: string;
  } | null>(null);

  // Image Sheet state for native bottom sheet image selection
  const [imageSheetTarget, setImageSheetTarget] = useState<"avatar" | "banner" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localBanner, setLocalBanner] = useState<string | null>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [isInitialPostsLoading, setIsInitialPostsLoading] = useState(true);

  // Live social profile states from backend (/v1/meta/me and /v1/profiles/:id)
  const [socialProfile, setSocialProfile] = useState<any>(null);
  const [profileDetail, setProfileDetail] = useState<ProfileDetail | null>(null);

  // Community Store
  const posts = useCommunityStore((s) => s.posts);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const toggleBookmark = useCommunityStore((s) => s.toggleBookmark);

  // Streak Store
  const currentStreak = useStreakStore((s) => s.currentStreak);
  const syncServerStreak = useStreakStore((s) => s.syncServerStreak);

  // Programs Store (Campus Gatherings)
  const programs = useProgramsStore((s) => s.programs);
  const loadPrograms = useProgramsStore((s) => s.loadPrograms);

  // Teams Store (Ministry Teams)
  const teams = useTeamsStore((s) => s.teams);
  const loadTeams = useTeamsStore((s) => s.loadTeams);

  // Current Member details from community cache (ignore synthetic actor records)
  const rawCurrentMember = useCommunityStore((s) =>
    user?.id ? s.members[user.id] : undefined
  );
  const currentMember = rawCurrentMember?.isActor ? undefined : rawCurrentMember;

  // Fetched author and liked posts from backend
  const [fetchedAuthorPosts, setFetchedAuthorPosts] = useState<CommunityPost[]>([]);
  const [fetchedLikedPosts, setFetchedLikedPosts] = useState<CommunityPost[]>([]);
  const [userMinistries, setUserMinistries] = useState<any[]>([]);

  // Refresh user data from API (stable callback — no infinite loop)
  const loadProfileData = useCallback(async () => {
    const currentUser = useUserStore.getState().user;
    if (!currentUser?.id && !authState.authenticated) {
      setIsInitialPostsLoading(false);
      return;
    }

    try {
      // 1. Fetch fresh auth user and /v1/meta/me in parallel
      // (/v1/meta/me also ensures the user's ProfileModel document exists in MongoDB)
      const [freshUser, metaRes] = await Promise.all([
        getCurrentUserRef.current().catch(() => null),
        api.get("/v1/meta/me").catch(() => null),
      ]);

      const metaUser = metaRes?.data?.data?.user || metaRes?.data?.user || null;
      if (metaUser) {
        setSocialProfile(metaUser);
        const metaAvatar = extractMediaUrl(metaUser.avatar);
        const latestUser = useUserStore.getState().user;
        if (metaAvatar && latestUser && !latestUser.profileImage) {
          setUser({ ...latestUser, profileImage: metaAvatar });
        }
      }

      const targetUserId =
        freshUser?.id || currentUser?.id || metaUser?.id;

      if (targetUserId) {
        // 2. Fetch full social profile detail
        socialApi
          .getUserProfile(targetUserId)
          .then((prof) => {
            if (prof && prof.id) {
              setProfileDetail(prof);
              const profAvatar = extractMediaUrl(prof.avatar);
              const latestUser = useUserStore.getState().user;
              if (profAvatar && latestUser && !latestUser.profileImage) {
                setUser({ ...latestUser, profileImage: profAvatar });
              }
              const isSyntheticFallback =
                prof.streak?.current === 142 &&
                prof.counts?.connects === 1240 &&
                prof.counts?.following === 38;
              if (!isSyntheticFallback) {
                const member = apiProfileToMemberProfile(prof);
                useCommunityStore.setState((state) => ({
                  members: {
                    ...state.members,
                    [targetUserId]: member,
                    [member.id]: member,
                  },
                }));
              }
            }
          })
          .catch(() => {});

        // 3. Fetch author's posts
        socialApi
          .getUserPosts(targetUserId)
          .then((res) => {
            if (Array.isArray(res)) {
              setFetchedAuthorPosts(res.map(apiPostToCommunityPost));
            }
          })
          .catch(() => {})
          .finally(() => {
            setIsInitialPostsLoading(false);
          });

        // 4. Fetch user's liked posts
        socialApi
          .getUserLikedPosts(targetUserId)
          .then((res) => {
            if (Array.isArray(res)) {
              setFetchedLikedPosts(res.map(apiPostToCommunityPost));
            }
          })
          .catch(() => {});

        // 5. Fetch ministries
        socialApi
          .getUserMinistries(targetUserId)
          .then((res) => {
            if (Array.isArray(res)) {
              setUserMinistries(res);
            }
          })
          .catch(() => {});
      } else {
        setIsInitialPostsLoading(false);
      }

      // 6. Dynamically load active campus programs and teams
      loadPrograms().catch(() => {});
      loadTeams().catch(() => {});
    } catch {
      setIsInitialPostsLoading(false);
    }
  }, [authState.authenticated, loadPrograms, loadTeams]);

  // Refresh profile data and streak whenever screen gains focus
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
      syncServerStreak().catch(() => {});
      return () => {
        closeAvatarPreview();
      };
    }, [loadProfileData, syncServerStreak])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      await Promise.allSettled([
        loadProfileData(),
        syncServerStreak(),
        loadPrograms(true),
        loadTeams(true),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  // Image Selection Handler (Camera or Gallery with strict Aspect Ratio handling)
  const handlePickImage = async (
    target: "avatar" | "banner",
    source: "camera" | "library"
  ) => {
    try {
      setImageSheetTarget(null);

      if (source === "camera") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission Required",
            text2: "Camera access is needed to capture photos.",
          });
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Toast.show({
            type: "error",
            text1: "Permission Required",
            text2: "Media library access is needed to select photos.",
          });
          return;
        }
      }

      const aspect: [number, number] = target === "avatar" ? [1, 1] : [3, 1];
      const launchFn =
        source === "camera"
          ? ImagePicker.launchCameraAsync
          : ImagePicker.launchImageLibraryAsync;

      const result = await launchFn({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect,
        quality: 0.85,
      });

      if (result.canceled || !result.assets || !result.assets[0]?.uri) {
        return;
      }

      const pickedUri = result.assets[0].uri;
      setIsUploading(true);

      if (target === "avatar") {
        const previousAvatar = user?.profileImage;
        if (user) {
          setUser({ ...user, profileImage: pickedUri });
        }
        try {
          // Ensure ProfileModel exists and update both Auth UserModel & Social ProfileModel
          const [updated] = await Promise.all([
            authService.updateProfile({ profileImage: pickedUri }),
            (async () => {
              try {
                await api.get("/v1/meta/me").catch(() => {});
                const uploaded = await socialApi.uploadMediaFile(pickedUri, "avatar");
                if (uploaded.assetId) {
                  await api.post("/v1/me/avatar", { assetId: uploaded.assetId });
                }
              } catch {
                // Non-fatal if social avatar sync fails
              }
            })(),
          ]);
          setUser(updated);
          if (updated?.profileImage) {
            setSocialProfile((prev: any) =>
              prev ? { ...prev, avatar: updated.profileImage } : prev
            );
          }
          Toast.show({
            type: "success",
            text1: "Profile Photo Updated",
            text2: "Your new avatar has been saved successfully.",
          });
        } catch (err: any) {
          if (user) {
            setUser({ ...user, profileImage: previousAvatar });
          }
          Toast.show({
            type: "error",
            text1: "Upload Failed",
            text2: err.message || "Failed to save profile photo.",
          });
        }
      } else {
        const previousBanner = localBanner;
        setLocalBanner(pickedUri);
        try {
          // Ensure ProfileModel exists in MongoDB before setting coverAssetId
          await api.get("/v1/meta/me").catch(() => {});
          const uploaded = await socialApi.uploadMediaFile(pickedUri, "cover");
          if (uploaded.assetId) {
            await api.post("/v1/me/cover", {
              assetId: uploaded.assetId,
            });
          }
          const finalBannerUrl = uploaded.url || pickedUri;
          setLocalBanner(finalBannerUrl);
          if (user) {
            setUser({ ...user, coverImage: finalBannerUrl });
          }
          setSocialProfile((prev: any) =>
            prev ? { ...prev, cover: finalBannerUrl } : prev
          );
          if (user?.id) {
            useCommunityStore.setState((state) => {
              const member = state.members[user.id];
              if (member) {
                return {
                  members: {
                    ...state.members,
                    [user.id]: {
                      ...member,
                      banner: finalBannerUrl,
                    },
                  },
                };
              }
              return state;
            });
          }
          Toast.show({
            type: "success",
            text1: "Banner Updated",
            text2: "Your fellowship profile banner has been saved.",
          });
        } catch (err: any) {
          setLocalBanner(previousBanner);
          Toast.show({
            type: "error",
            text1: "Upload Failed",
            text2: err.message || "Could not update cover banner.",
          });
        }
      }
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Image Selection Error",
        text2: err.message || "Something went wrong.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Profile data derivations (100% dynamic — zero hardcoded fallbacks)
  const resolvedAvatarFromSocial =
    extractMediaUrl(socialProfile?.avatar) ||
    extractMediaUrl(profileDetail?.avatar);

  const avatarUri =
    user?.profileImage ||
    resolvedAvatarFromSocial ||
    getPrefilledAvatar(user?.phoneNumber || user?.id || "fellow");

  const fullNameDisplay =
    user?.fullName?.trim() ||
    socialProfile?.displayName?.trim() ||
    profileDetail?.displayName?.trim() ||
    currentMember?.fullName?.trim() ||
    "Fellowship Member";

  const avatarInitial =
    fullNameDisplay
      .replace(/^@/, "")
      .charAt(0)
      .toUpperCase() || "?";

  const teamName =
    typeof user?.team === "string"
      ? user.team
      : (user?.team as any)?.name ||
        currentMember?.team ||
        "";

  const isAssignedTeam = Boolean(teamName && teamName !== "Fellowship Member" && teamName !== "member");

  const isSyntheticProfileDetail =
    profileDetail?.streak?.current === 142 &&
    profileDetail?.counts?.connects === 1240 &&
    profileDetail?.counts?.following === 38;

  const department =
    user?.department?.trim() ||
    (!isSyntheticProfileDetail ? profileDetail?.academic?.department?.trim() : "") ||
    currentMember?.department?.trim() ||
    "";

  const academicYear =
    user?.yearOfStudy?.trim() ||
    (!isSyntheticProfileDetail && profileDetail?.academic?.studyYear
      ? String(profileDetail.academic.studyYear)
      : "") ||
    currentMember?.academicYear?.trim() ||
    "";

  const displayAcademicYear = academicYear
    ? /^\d+$/.test(academicYear)
      ? `Year ${academicYear}`
      : academicYear
    : "";

  const rawUsername =
    user?.username ||
    socialProfile?.username ||
    (!isSyntheticProfileDetail ? profileDetail?.username : "") ||
    currentMember?.handle ||
    user?.telegramUserName ||
    "";

  const systemHandle = rawUsername
    ? `@${rawUsername.replace(/^@/, "")}`
    : user?.fullName
    ? `@${user.fullName.toLowerCase().replace(/[^a-z0-9_]/g, "")}`
    : "";

  const connectsCount =
    socialProfile?.followersCount ??
    (!isSyntheticProfileDetail ? profileDetail?.counts?.connects : undefined) ??
    currentMember?.followersCount ??
    0;

  const followingCount =
    socialProfile?.followingCount ??
    (!isSyntheticProfileDetail ? profileDetail?.counts?.following : undefined) ??
    currentMember?.followingCount ??
    0;

  const memberBio =
    socialProfile?.bio?.trim() ||
    (!isSyntheticProfileDetail ? profileDetail?.bio?.trim() : "") ||
    currentMember?.bio?.trim() ||
    (user as any)?.bio?.trim() ||
    "";

  const joinedDate = formatJoinedDate(
    user?.createdAt ||
      (!isSyntheticProfileDetail ? profileDetail?.joinedAt : null)
  );

  const location =
    socialProfile?.location?.trim() ||
    (!isSyntheticProfileDetail ? profileDetail?.location?.trim() : "") ||
    currentMember?.location?.trim() ||
    (user as any)?.location?.trim() ||
    "";

  const hasMetadata = Boolean(
    department ||
    displayAcademicYear ||
    location ||
    joinedDate
  );

  const resolvedCoverFromSocial =
    extractMediaUrl(socialProfile?.cover) ||
    (!isSyntheticProfileDetail ? extractMediaUrl(profileDetail?.cover) : null);

  const rawBannerCandidate =
    localBanner ||
    user?.coverImage ||
    resolvedCoverFromSocial ||
    currentMember?.banner ||
    null;

  const bannerUri = isFallbackUnsplashBanner(rawBannerCandidate)
    ? null
    : rawBannerCandidate;

  // Merged live author posts (combining fetched + live store state)
  const authorPosts = useMemo(() => {
    const livePostMap = new Map<string, CommunityPost>();
    for (const p of posts) {
      livePostMap.set(p.id, p);
    }

    const merged = new Map<string, CommunityPost>();

    // First include any newly created posts in store authored by current user
    for (const p of posts) {
      const isMine =
        (user?.id && p.authorId === user.id) ||
        (user?.fullName && p.authorName === user.fullName) ||
        (systemHandle &&
          p.authorHandle?.replace(/^@/, "").toLowerCase() ===
            systemHandle.replace(/^@/, "").toLowerCase());
      if (isMine) {
        merged.set(p.id, p);
      }
    }

    // Merge server-fetched author posts
    for (const p of fetchedAuthorPosts) {
      const live = livePostMap.get(p.id);
      merged.set(p.id, live ? { ...p, ...live } : p);
    }

    return Array.from(merged.values());
  }, [posts, fetchedAuthorPosts, user, systemHandle]);

  // Media posts (author posts that have an image)
  const mediaPosts = useMemo(() => {
    return authorPosts.filter((p) => Boolean(p.image));
  }, [authorPosts]);

  // Liked posts (combining fetched liked posts + live liked posts from community store)
  const likedPosts = useMemo(() => {
    const livePostMap = new Map<string, CommunityPost>();
    for (const p of posts) {
      livePostMap.set(p.id, p);
    }

    const merged = new Map<string, CommunityPost>();
    for (const p of fetchedLikedPosts) {
      const live = livePostMap.get(p.id);
      const effective = live ? { ...p, ...live } : p;
      if (effective.isLiked !== false) {
        merged.set(p.id, { ...effective, isLiked: true });
      }
    }
    for (const p of posts) {
      if (p.isLiked) {
        merged.set(p.id, p);
      } else if (merged.has(p.id) && !p.isLiked) {
        merged.delete(p.id);
      }
    }
    return Array.from(merged.values());
  }, [fetchedLikedPosts, posts]);

  // Reliable Like Handler (works for both store posts and profile-fetched posts)
  const handleToggleLike = useCallback(
    async (item: CommunityPost) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const prevLiked = Boolean(item.isLiked);
      const prevCount = item.likesCount ?? 0;
      const nextLiked = !prevLiked;
      const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

      const updateItem = (p: CommunityPost) =>
        p.id === item.id
          ? { ...p, isLiked: nextLiked, likesCount: nextCount }
          : p;

      setFetchedAuthorPosts((prev) => prev.map(updateItem));
      setFetchedLikedPosts((prev) =>
        nextLiked
          ? prev.some((p) => p.id === item.id)
            ? prev.map(updateItem)
            : [{ ...item, isLiked: true, likesCount: nextCount }, ...prev]
          : prev.filter((p) => p.id !== item.id)
      );

      const inStore = useCommunityStore
        .getState()
        .posts.some((p) => p.id === item.id);
      if (inStore) {
        await toggleLike(item.id);
      } else {
        try {
          if (nextLiked) {
            await socialApi.likePost(item.id);
          } else {
            await socialApi.unlikePost(item.id);
          }
        } catch {
          const rollbackItem = (p: CommunityPost) =>
            p.id === item.id
              ? { ...p, isLiked: prevLiked, likesCount: prevCount }
              : p;
          setFetchedAuthorPosts((prev) => prev.map(rollbackItem));
          setFetchedLikedPosts((prev) =>
            prevLiked
              ? prev.some((p) => p.id === item.id)
                ? prev.map(rollbackItem)
                : [{ ...item, isLiked: true, likesCount: prevCount }, ...prev]
              : prev.filter((p) => p.id !== item.id)
          );
        }
      }
    },
    [toggleLike]
  );

  // Reliable Bookmark Handler
  const handleToggleBookmark = useCallback(
    async (item: CommunityPost) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      const prevBookmarked = Boolean(item.isBookmarked);
      const nextBookmarked = !prevBookmarked;

      const updateItem = (p: CommunityPost) =>
        p.id === item.id ? { ...p, isBookmarked: nextBookmarked } : p;

      setFetchedAuthorPosts((prev) => prev.map(updateItem));
      setFetchedLikedPosts((prev) => prev.map(updateItem));

      const inStore = useCommunityStore
        .getState()
        .posts.some((p) => p.id === item.id);
      if (inStore) {
        await toggleBookmark(item.id);
      } else {
        try {
          if (nextBookmarked) {
            await socialApi.bookmarkPost(item.id);
          } else {
            await socialApi.unbookmarkPost(item.id);
          }
        } catch {
          const rollbackItem = (p: CommunityPost) =>
            p.id === item.id ? { ...p, isBookmarked: prevBookmarked } : p;
          setFetchedAuthorPosts((prev) => prev.map(rollbackItem));
          setFetchedLikedPosts((prev) => prev.map(rollbackItem));
        }
      }
    },
    [toggleBookmark]
  );

  // Delete Own Post Handler
  const handleConfirmDeletePost = useCallback(async () => {
    const targetId = deletePostId;
    setDeletePostId(null);
    if (!targetId) return;

    const prevAuthorPosts = fetchedAuthorPosts;
    setFetchedAuthorPosts((prev) => prev.filter((p) => p.id !== targetId));
    setFetchedLikedPosts((prev) => prev.filter((p) => p.id !== targetId));
    useCommunityStore.setState((state) => ({
      posts: state.posts.filter((p) => p.id !== targetId),
      forYouPosts: (state.forYouPosts || []).filter((p) => p.id !== targetId),
      followingPosts: (state.followingPosts || []).filter(
        (p) => p.id !== targetId
      ),
    }));

    try {
      await socialApi.deletePost(targetId);
      Toast.show({
        type: "success",
        text1: "Reflection Deleted",
        text2: "Your reflection has been removed.",
      });
    } catch (err: any) {
      setFetchedAuthorPosts(prevAuthorPosts);
      Toast.show({
        type: "error",
        text1: "Delete Failed",
        text2: err?.message || "Could not delete reflection.",
      });
    }
  }, [deletePostId, fetchedAuthorPosts]);

  // Handlers
  const handleSignOut = async () => {
    setSignOutConfirm(false);
    try {
      await logout();
      router.replace("/(auth)/sign-in");
    } catch {
      // ignore
    }
  };

  const handleShareApp = async () => {
    try {
      await Haptics.selectionAsync();
      await Share.share({
        title: "4 Kilo Fellowship",
        message: `Connect with ${fullNameDisplay} on 4 Kilo Christian Students Fellowship! Download the app: https://t.me/ecsf4kilo`,
      });
    } catch {
      // ignore
    }
  };

  const handleThemeChange = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleTheme();
  };

  // Palette matching design system (Pure White Light Theme / Deep Zinc Dark Theme)
  const bgColor = isDark ? "#09090b" : "#ffffff";
  const cardBg = isDark ? "#18181b" : "#ffffff";
  const cardBorder = isDark ? "#27272a" : "#e2e8f0";
  const textPrimary = isDark ? "#ffffff" : "#0f172a";
  const textSecondary = isDark ? "#a1a1aa" : "#475569";
  const textTertiary = isDark ? "#71717a" : "#64748b";
  const pillBg = isDark ? "#27272a" : "#f8fafc";
  const dividerColor = isDark ? "#27272a" : "#f1f5f9";
  const iconMuted = isDark ? "#a1a1aa" : "#475569";

  // Render Twitter-style Reflection Feed Card
  const renderPostCard = (item: CommunityPost, isOwnPost = false) => {
    const isCurrentUser =
      isOwnPost ||
      (user?.id && item.authorId === user.id) ||
      (user?.fullName && item.authorName === user.fullName) ||
      item.authorId === "user-unknown";

    const displayName =
      item.authorName &&
      item.authorName !== "Unknown Member" &&
      item.authorName !== "Fellowship Member"
        ? item.authorName
        : isCurrentUser
        ? fullNameDisplay
        : item.authorName && item.authorName !== "Unknown Member"
        ? item.authorName
        : "Fellowship Member";

    const displayHandle =
      item.authorHandle &&
      item.authorHandle !== "@unknown" &&
      item.authorHandle !== "@fellow"
        ? item.authorHandle
        : isCurrentUser && systemHandle
        ? systemHandle
        : "";

    const displayAvatar =
      item.authorAvatar ||
      (isCurrentUser ? avatarUri : getPrefilledAvatar(item.authorId || item.id));

    return (
      <View
        key={item.id}
        style={[
          styles.postCard,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
          },
        ]}
      >
        <View style={styles.postCardRow}>
          <ProfileLink
            user={{
              id: isCurrentUser ? user?.id || "me" : item.authorId || "me",
              name: displayName,
              username: displayHandle,
              avatarUrl: displayAvatar,
              team: item.authorTeam || teamName,
            }}
            size={40}
            showAvatar={true}
          />

          <View style={styles.postBody}>
            <View style={styles.postAuthorLine}>
              <Text
                style={[styles.postAuthorName, { color: textPrimary }]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={PRIMARY}
                style={{ marginLeft: 3, flexShrink: 0 }}
              />
              {displayHandle ? (
                <Text
                  style={[styles.postHandleText, { color: textSecondary }]}
                  numberOfLines={1}
                >
                  {displayHandle}
                </Text>
              ) : null}
              {item.timestamp ? (
                <Text style={[styles.postTimeText, { color: textTertiary }]}>
                  · {item.timestamp}
                </Text>
              ) : null}

              {isCurrentUser && (
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setDeletePostId(item.id);
                  }}
                  hitSlop={8}
                  style={styles.postDeleteBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Delete Reflection"
                >
                  <Ionicons
                    name="trash-outline"
                    size={14}
                    color={textTertiary}
                  />
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={() => router.push(`/community/${item.id}` as any)}
            >
              <Text style={[styles.postContentText, { color: textPrimary }]}>
                {item.content}
              </Text>
            </Pressable>

            {item.image ? (
              <Pressable
                onPress={() =>
                  setLightboxImage({
                    uri:
                      typeof item.image === "string"
                        ? item.image
                        : item.image?.uri,
                    caption: item.content,
                    author: displayName,
                  })
                }
                style={styles.postImageWrap}
              >
                <ExpoImage
                  source={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image
                  }
                  style={styles.postImage}
                  contentFit="cover"
                  transition={200}
                />
              </Pressable>
            ) : null}

            <View style={styles.postActionsRow}>
              <Pressable
                onPress={() => router.push(`/community/${item.id}` as any)}
                hitSlop={6}
                style={styles.postActionBtn}
              >
                <Ionicons
                  name="chatbubble-outline"
                  size={16}
                  color={textSecondary}
                />
                <Text style={[styles.postActionCount, { color: textSecondary }]}>
                  {item.repliesCount ?? 0}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleToggleLike(item)}
                hitSlop={6}
                style={styles.postActionBtn}
              >
                <Ionicons
                  name={item.isLiked ? "heart" : "heart-outline"}
                  size={17}
                  color={item.isLiked ? "#f91880" : textSecondary}
                />
                <Text
                  style={[
                    styles.postActionCount,
                    { color: item.isLiked ? "#f91880" : textSecondary },
                  ]}
                >
                  {item.likesCount ?? 0}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => handleToggleBookmark(item)}
                hitSlop={6}
                style={styles.postActionBtn}
              >
                <Ionicons
                  name={item.isBookmarked ? "bookmark" : "bookmark-outline"}
                  size={16}
                  color={item.isBookmarked ? PRIMARY : textSecondary}
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  Share.share({
                    message: `"${item.content}" — ${displayName} on 4 Kilo Fellowship`,
                  });
                }}
                hitSlop={6}
                style={styles.postActionBtn}
              >
                <Ionicons
                  name="share-outline"
                  size={16}
                  color={textSecondary}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Tab Contents
  const renderPostsTab = () => {
    if (isInitialPostsLoading && authorPosts.length === 0) {
      return (
        <View style={styles.loadingStateWrap}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={[styles.loadingStateText, { color: textSecondary }]}>
            Loading reflections...
          </Text>
        </View>
      );
    }

    if (authorPosts.length === 0) {
      return (
        <View
          style={[
            styles.emptyStateCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={42}
            color={PRIMARY}
          />
          <Text style={[styles.emptyTitle, { color: textPrimary }]}>
            Share Your First Reflection
          </Text>
          <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
            Inspire your fellow campus brothers and sisters by sharing what
            the Lord is ministering to your heart today.
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              router.push("/community/compose" as any);
            }}
            style={[styles.emptyCtaBtn, { backgroundColor: PRIMARY }]}
          >
            <Ionicons name="create-outline" size={17} color="#ffffff" />
            <Text style={styles.emptyCtaText}>Write Reflection</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.postsList}>
        {authorPosts.map((post) => renderPostCard(post, true))}
      </View>
    );
  };

  const renderMediaTab = () => {
    if (mediaPosts.length === 0) {
      return (
        <View
          style={[
            styles.emptyStateCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Ionicons name="images-outline" size={42} color={PRIMARY} />
          <Text style={[styles.emptyTitle, { color: textPrimary }]}>
            No Fellowship Media Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
            Photos and images you share with your reflections will appear here.
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              router.push("/community/compose" as any);
            }}
            style={[styles.emptyCtaBtn, { backgroundColor: PRIMARY }]}
          >
            <Ionicons name="camera-outline" size={17} color="#ffffff" />
            <Text style={styles.emptyCtaText}>Share Media Reflection</Text>
          </Pressable>
        </View>
      );
    }
    const gridItemSize = (SCREEN_WIDTH - 36) / 3;
    return (
      <View style={styles.mediaGrid}>
        {mediaPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            activeOpacity={0.88}
            onPress={() =>
              setLightboxImage({
                uri:
                  typeof post.image === "string"
                    ? post.image
                    : post.image?.uri,
                caption: post.content,
                author: fullNameDisplay,
              })
            }
            style={[
              styles.mediaGridCell,
              {
                width: gridItemSize,
                height: gridItemSize,
                backgroundColor: cardBg,
                borderColor: cardBorder,
              },
            ]}
          >
            <ExpoImage
              source={
                typeof post.image === "string"
                  ? { uri: post.image }
                  : post.image
              }
              style={styles.mediaGridImage}
              contentFit="cover"
            />
            <View style={styles.mediaLikesBadge}>
              <Ionicons name="heart" size={11} color="#ffffff" />
              <Text style={styles.mediaLikesText}>{post.likesCount ?? 0}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const matchingTeam = useMemo(() => {
    if (!teamName) return undefined;
    return teams.find(
      (t) =>
        t.name.toLowerCase() === teamName.toLowerCase() ||
        t.id === teamName ||
        (t as any)._id === teamName
    );
  }, [teams, teamName]);

  const handleNavigateTeam = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    if (matchingTeam?.id) {
      router.push(`/teams/${matchingTeam.id}` as any);
    } else {
      router.push("/teams" as any);
    }
  }, [matchingTeam, router]);

  const renderMinistryTab = () => {
    return (
      <View style={styles.ministryTabWrap}>
        {userMinistries.length > 0 ? (
          userMinistries.map((m: any) => (
            <View
              key={m.id || m.name}
              style={[
                styles.infoCard,
                { backgroundColor: cardBg, borderColor: cardBorder },
              ]}
            >
              <View style={styles.ministryHeaderRow}>
                <View
                  style={[
                    styles.ministryIconWrap,
                    { backgroundColor: `${PRIMARY}18` },
                  ]}
                >
                  <Ionicons name="flame" size={20} color={PRIMARY} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ministryTitle, { color: textPrimary }]}>
                    {m.name}
                  </Text>
                  <Text style={[styles.ministrySub, { color: textSecondary }]}>
                    {m.role || "Active Fellowship Ministry"}
                  </Text>
                </View>
              </View>
              {m.description ? (
                <Text style={[styles.ministryDesc, { color: textSecondary }]}>
                  {m.description}
                </Text>
              ) : null}
              {m.badge ? (
                <Text
                  style={[
                    styles.teamActionText,
                    { color: PRIMARY, fontWeight: "600" },
                  ]}
                >
                  {m.badge}
                </Text>
              ) : null}
            </View>
          ))
        ) : isAssignedTeam ? (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <View style={styles.ministryHeaderRow}>
              <View
                style={[
                  styles.ministryIconWrap,
                  { backgroundColor: `${PRIMARY}18` },
                ]}
              >
                <Ionicons name="flame" size={20} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ministryTitle, { color: textPrimary }]}>
                  {teamName}
                </Text>
                <Text style={[styles.ministrySub, { color: textSecondary }]}>
                  Active Ministry Assignment
                </Text>
              </View>
              <Pressable
                onPress={handleNavigateTeam}
                style={styles.teamActionBadge}
              >
                <Text style={styles.teamActionText}>View Team</Text>
                <Ionicons name="chevron-forward" size={13} color={PRIMARY} />
              </Pressable>
            </View>

            {matchingTeam?.description || matchingTeam?.about ? (
              <Text style={[styles.ministryDesc, { color: textSecondary }]}>
                {matchingTeam.description || matchingTeam.about}
              </Text>
            ) : null}

            {matchingTeam?.meetingDay ? (
              <View style={[styles.scheduleRow, { borderBottomWidth: 0, paddingTop: 4 }]}>
                <Ionicons name="time-outline" size={14} color={PRIMARY} />
                <Text style={[styles.scheduleMeta, { color: textSecondary }]}>
                  Team Meeting: {matchingTeam.meetingDay}
                  {matchingTeam.time ? ` · ${matchingTeam.time}` : ""}
                  {matchingTeam.location ? ` (${matchingTeam.location})` : ""}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View
            style={[
              styles.infoCard,
              { backgroundColor: cardBg, borderColor: cardBorder },
            ]}
          >
            <View style={styles.ministryHeaderRow}>
              <View
                style={[
                  styles.ministryIconWrap,
                  { backgroundColor: `${PRIMARY}18` },
                ]}
              >
                <Ionicons name="people-outline" size={20} color={PRIMARY} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.ministryTitle, { color: textPrimary }]}>
                  Ministry Teams
                </Text>
                <Text style={[styles.ministrySub, { color: textSecondary }]}>
                  Not yet assigned to a team
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync().catch(() => {});
                  router.push("/teams" as any);
                }}
                style={styles.teamActionBadge}
              >
                <Text style={styles.teamActionText}>Join Team</Text>
                <Ionicons name="chevron-forward" size={13} color={PRIMARY} />
              </Pressable>
            </View>

            <Text style={[styles.ministryDesc, { color: textSecondary }]}>
              Join a ministry team to serve alongside fellowship brothers and sisters in prayer, worship, discipleship, and campus outreach.
            </Text>
          </View>
        )}

        {/* Dynamic Campus Gatherings & Programs */}
        <View
          style={[
            styles.infoCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={[styles.sectionHeading, { color: textTertiary, marginBottom: 0 }]}>
              CAMPUS GATHERINGS & PROGRAMS
            </Text>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push("/programs" as any);
              }}
              hitSlop={8}
            >
              <Text style={{ fontSize: 12, color: PRIMARY, fontWeight: "600" }}>
                See All
              </Text>
            </Pressable>
          </View>

          {programs.length > 0 ? (
            programs.map((prog, index) => {
              const isLast = index === programs.length - 1;
              const isPrayer = prog.category?.toLowerCase().includes("prayer") || prog.title?.toLowerCase().includes("prayer");
              const isWorship = prog.category?.toLowerCase().includes("worship") || prog.title?.toLowerCase().includes("worship");
              const iconName = isPrayer ? "calendar-outline" : isWorship ? "musical-notes-outline" : "flame-outline";

              return (
                <Pressable
                  key={prog.id || index}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    router.push("/programs" as any);
                  }}
                  style={[
                    styles.scheduleRow,
                    {
                      borderBottomColor: dividerColor,
                      borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <Ionicons name={iconName} size={16} color={PRIMARY} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.scheduleName, { color: textPrimary }]}>
                      {prog.title}
                    </Text>
                    <Text style={[styles.scheduleMeta, { color: textSecondary }]}>
                      {prog.day ? `${prog.day}` : ""}
                      {prog.time ? ` · ${prog.time}` : ""}
                      {prog.location ? ` (${prog.location})` : ""}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={textTertiary} />
                </Pressable>
              );
            })
          ) : (
            <Text style={[styles.scheduleMeta, { color: textSecondary, paddingVertical: 6 }]}>
              No campus gatherings scheduled at this time.
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderLikesTab = () => {
    if (likedPosts.length === 0) {
      return (
        <View
          style={[
            styles.emptyStateCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          <Ionicons
            name="heart-outline"
            size={42}
            color={PRIMARY}
          />
          <Text style={[styles.emptyTitle, { color: textPrimary }]}>
            No Liked Reflections Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: textSecondary }]}>
            Reflections you like in the fellowship community feed will appear
            here for quick access.
          </Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              router.push("/(tabs)/community" as any);
            }}
            style={[styles.emptyCtaBtn, { backgroundColor: PRIMARY }]}
          >
            <Ionicons name="sparkles-outline" size={16} color="#ffffff" />
            <Text style={styles.emptyCtaText}>Explore Community Feed</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.postsList}>
        {likedPosts.map((post) => renderPostCard(post, false))}
      </View>
    );
  };

  const renderAccountTab = () => {
    return (
      <View style={styles.accountTabWrap}>
        <View
          style={[
            styles.menuCard,
            { backgroundColor: cardBg, borderColor: cardBorder },
          ]}
        >
          {/* Dark Theme Native Switch */}
          <View style={[styles.menuItem, { borderBottomColor: dividerColor }]}>
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: pillBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons
                name={isDark ? "moon-outline" : "sunny-outline"}
                size={18}
                color={iconMuted}
              />
            </View>
            <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
              Dark Theme
            </Text>
            <Switch
              value={isDark}
              onValueChange={handleThemeChange}
              thumbColor={
                Platform.OS === "android"
                  ? isDark
                    ? PRIMARY
                    : "#f4f3f4"
                  : undefined
              }
              trackColor={{ false: "#e4e4e7", true: `${PRIMARY}99` }}
            />
          </View>

          {/* Edit Profile */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              router.push("/edit-profile" as any);
            }}
            style={({ pressed }) => [
              styles.menuItem,
              {
                borderBottomColor: dividerColor,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: pillBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons name="create-outline" size={18} color={iconMuted} />
            </View>
            <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
              Edit Profile Information
            </Text>
            <Ionicons name="chevron-forward" size={18} color={textTertiary} />
          </Pressable>

          {/* Ministry Teams */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              router.push("/teams" as any);
            }}
            style={({ pressed }) => [
              styles.menuItem,
              {
                borderBottomColor: dividerColor,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: pillBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons name="people-outline" size={18} color={iconMuted} />
            </View>
            <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
              Fellowship Ministry Teams
            </Text>
            <Ionicons name="chevron-forward" size={18} color={textTertiary} />
          </Pressable>

          {/* Settings & Preferences */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              router.push("/settings" as any);
            }}
            style={({ pressed }) => [
              styles.menuItem,
              {
                borderBottomColor: dividerColor,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: pillBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons name="options-outline" size={18} color={iconMuted} />
            </View>
            <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
              Settings & Preferences
            </Text>
            <Ionicons name="chevron-forward" size={18} color={textTertiary} />
          </Pressable>

          {/* Help & Support */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              router.push("/help" as any);
            }}
            style={({ pressed }) => [
              styles.menuItem,
              {
                borderBottomColor: dividerColor,
                opacity: pressed ? 0.65 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: pillBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={18}
                color={iconMuted}
              />
            </View>
            <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
              Help & Support
            </Text>
            <Ionicons name="chevron-forward" size={18} color={textTertiary} />
          </Pressable>

          {/* About Fellowship */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              router.push("/about" as any);
            }}
            style={({ pressed }) => [
              styles.menuItem,
              { borderBottomWidth: 0, opacity: pressed ? 0.65 : 1 },
            ]}
          >
            <View
              style={[
                styles.menuItemIcon,
                { backgroundColor: pillBg, borderColor: cardBorder },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={iconMuted}
              />
            </View>
            <Text style={[styles.menuItemLabel, { color: textPrimary }]}>
              About 4 Kilo Fellowship
            </Text>
            <Ionicons name="chevron-forward" size={18} color={textTertiary} />
          </Pressable>
        </View>

        {/* Sign Out Button */}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {}
            );
            setSignOutConfirm(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign Out of Account"
          android_ripple={{
            color: "rgba(239, 68, 68, 0.15)",
            borderless: false,
          }}
          style={({ pressed }) => [
            styles.signOutBtn,
            {
              backgroundColor: isDark
                ? "rgba(239, 68, 68, 0.12)"
                : "#fef2f2",
              borderColor: isDark
                ? "rgba(239, 68, 68, 0.3)"
                : "#fecaca",
              opacity: Platform.OS === "ios" && pressed ? 0.75 : 1,
            },
          ]}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>

        {/* App Version Info Footer */}
        <View style={styles.accountFooter}>
          <Text style={[styles.footerFellowshipText, { color: textTertiary }]}>
            4 Kilo Christian Students Fellowship
          </Text>
          <Text style={[styles.footerVersionText, { color: textTertiary }]}>
            AAU ECSF · Version 1.0.0
          </Text>
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "posts":
        return renderPostsTab();
      case "media":
        return renderMediaTab();
      case "ministry":
        return renderMinistryTab();
      case "likes":
        return renderLikesTab();
      case "account":
        return renderAccountTab();
      default:
        return null;
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* MainTabHeader — Notification on left, centered title, settings on right */}
      <MainTabHeader
        showAvatar={false}
        showStreak={false}
        showNotification={true}
        notificationPosition="left"
        showSettings={true}
        borderBottom={false}
        title="Profile"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY}
            colors={[PRIMARY]}
          />
        }
      >
        {/* Cover Hero Banner with Solid Placeholder Fallback & Edit Cover Button */}
        <View style={styles.bannerWrap}>
          {bannerUri ? (
            <ExpoImage
              source={typeof bannerUri === "string" ? { uri: bannerUri } : bannerUri}
              style={styles.bannerImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={[
                styles.bannerEmptyDoom,
                { backgroundColor: isDark ? "#18181b" : "#e2e8f0" },
              ]}
            />
          )}

          {bannerUri ? <View style={styles.bannerOverlay} /> : null}

          {/* Floating 'Edit Cover' Button on Banner */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {}
              );
              setImageSheetTarget("banner");
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Change profile header banner"
            style={({ pressed }) => [
              styles.bannerEditBtn,
              {
                backgroundColor: isDark
                  ? "rgba(24, 24, 27, 0.85)"
                  : "rgba(0, 0, 0, 0.65)",
                borderColor: isDark
                  ? "rgba(255, 255, 255, 0.2)"
                  : "rgba(255, 255, 255, 0.35)",
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Ionicons name="camera-outline" size={14} color="#ffffff" />
            <Text style={styles.bannerEditText}>Edit cover</Text>
          </Pressable>

          {/* Uploading Status Overlay */}
          {isUploading && (
            <View style={styles.bannerLoadingOverlay}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.bannerLoadingText}>Saving photo...</Text>
            </View>
          )}
        </View>

        {/* Profile Overlapping Avatar & Action Buttons Bar */}
        <View style={styles.profileActionRow}>
          {/* Overlapping Avatar with Click-to-Edit Photo Action */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {}
              );
              setImageSheetTarget("avatar");
            }}
            accessibilityRole="button"
            accessibilityLabel="Change profile photo"
            style={styles.avatarWrap}
          >
            <View
              style={[
                styles.avatarRing,
                {
                  borderColor: bgColor,
                  backgroundColor: bgColor,
                },
              ]}
            >
              {avatarUri ? (
                <LongPressAvatar
                  size={80}
                  uri={avatarUri}
                  name={fullNameDisplay}
                  imageStyle={styles.avatarImage}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setImageSheetTarget("avatar");
                  }}
                />
              ) : (
                <View
                  style={[
                    styles.avatarFallback,
                    {
                      backgroundColor: isDark ? "#271c19" : "#fff7ed",
                      borderColor: isDark ? "#7c2d12" : "#fed7aa",
                    },
                  ]}
                >
                  <Text style={styles.avatarInitialText}>{avatarInitial}</Text>
                </View>
              )}
            </View>

            {/* Camera Edit Badge */}
            <View style={[styles.avatarCameraBadge, { borderColor: bgColor }]}>
              <Ionicons name="camera" size={13} color="#ffffff" />
            </View>
          </Pressable>

          {/* Action Buttons: Share, Edit Profile */}
          <View style={styles.topActionBtnsGroup}>
            <Pressable
              onPress={handleShareApp}
              accessibilityRole="button"
              accessibilityLabel="Share Profile"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
                borderless: false,
              }}
              style={({ pressed }) => [
                styles.secondaryPillBtn,
                {
                  backgroundColor: isDark ? "#27272a" : "#ffffff",
                  borderColor: isDark ? "#3f3f46" : "#cbd5e1",
                  opacity: Platform.OS === "ios" && pressed ? 0.75 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.secondaryPillText,
                  { color: isDark ? "#ffffff" : "#000000" },
                ]}
              >
                Share
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                  () => {}
                );
                router.push("/edit-profile" as any);
              }}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
              android_ripple={{
                color: "rgba(255, 255, 255, 0.2)",
                borderless: false,
              }}
              style={({ pressed }) => [
                styles.primaryPillBtn,
                {
                  backgroundColor: isDark ? "#ffffff" : "#000000",
                  borderColor: isDark ? "#ffffff" : "#000000",
                  opacity: Platform.OS === "ios" && pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.primaryPillText,
                  { color: isDark ? "#000000" : "#ffffff" },
                ]}
              >
                Edit profile
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Member Identity: Name, Handle & Verified Status */}
        <View style={styles.identityContainer}>
          <View style={styles.nameLine}>
            <Text
              style={[styles.displayName, { color: textPrimary }]}
              numberOfLines={1}
            >
              {fullNameDisplay}
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={19}
              color={PRIMARY}
              style={{ marginLeft: 5, flexShrink: 0 }}
            />
          </View>

          {/* Handle and Streak pill row */}
          <View style={styles.handleAndStreakRow}>
            {systemHandle ? (
              <Text style={[styles.handleLine, { color: textSecondary }]}>
                {systemHandle}
              </Text>
            ) : null}

            {currentStreak > 0 ? (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                    () => {}
                  );
                  setStreakModalVisible(true);
                }}
                style={[
                  styles.badgePill,
                  {
                    backgroundColor: isDark ? "#451a03" : "#fff7ed",
                    borderColor: isDark ? "#7c2d12" : "#fed7aa",
                  },
                ]}
              >
                <Ionicons name="flame" size={12} color="#f97316" />
                <Text
                  style={[
                    styles.badgePillText,
                    { color: "#f97316", fontWeight: "700" },
                  ]}
                >
                  {currentStreak}d Streak
                </Text>
              </Pressable>
            ) : null}
          </View>

          {/* Status Badges Strip: Team (Dynamic) */}
          {isAssignedTeam ? (
            <View style={styles.badgesWrap}>
              <Pressable
                onPress={handleNavigateTeam}
                style={[
                  styles.badgePill,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 103, 25, 0.12)"
                      : "#fff7ed",
                    borderColor: `${PRIMARY}40`,
                  },
                ]}
              >
                <Ionicons name="heart" size={11} color={PRIMARY} />
                <Text style={[styles.badgePillText, { color: PRIMARY }]}>
                  {teamName}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Bio (Dynamic - never hardcoded) */}
          {memberBio ? (
            <Text style={[styles.bioText, { color: textPrimary }]}>
              {memberBio}
            </Text>
          ) : (
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push("/edit-profile" as any);
              }}
              style={({ pressed }) => [
                styles.bioPlaceholderBtn,
                {
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                  borderColor: isDark ? "#27272a" : "#e2e8f0",
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons name="create-outline" size={14} color={PRIMARY} />
              <Text style={[styles.bioPlaceholderText, { color: textSecondary }]}>
                Add a bio to your fellowship profile...
              </Text>
            </Pressable>
          )}

          {/* Dynamic Metadata Strip with Icons (render only existing attributes) */}
          {hasMetadata && (
            <View style={styles.metadataList}>
              {Boolean(department) && (
                <View style={styles.metaRow}>
                  <Ionicons name="school-outline" size={14} color={iconMuted} />
                  <Text style={[styles.metaText, { color: textSecondary }]}>
                    {department}
                  </Text>
                </View>
              )}

              {Boolean(displayAcademicYear) && (
                <View style={styles.metaRow}>
                  <Ionicons name="ribbon-outline" size={14} color={iconMuted} />
                  <Text style={[styles.metaText, { color: textSecondary }]}>
                    {displayAcademicYear}
                  </Text>
                </View>
              )}

              {Boolean(location) && (
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color={iconMuted} />
                  <Text style={[styles.metaText, { color: textSecondary }]}>
                    {location}
                  </Text>
                </View>
              )}

              {Boolean(joinedDate) && (
                <View style={styles.metaRow}>
                  <Ionicons name="calendar-outline" size={14} color={iconMuted} />
                  <Text style={[styles.metaText, { color: textSecondary }]}>
                    {joinedDate}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Social Stats Row: Following, Followers, Reflections */}
          <View style={[styles.statsStripRow, { borderTopColor: cardBorder }]}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push({
                  pathname: "/community/user/connections",
                  params: {
                    id: user?.id || socialProfile?.id,
                    initialTab: "following",
                    name: fullNameDisplay,
                  },
                } as any);
              }}
              style={styles.statCounterItem}
            >
              <Text style={[styles.statBold, { color: textPrimary }]}>
                {followingCount}
              </Text>
              <Text style={[styles.statMuted, { color: textSecondary }]}>
                Following
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                router.push({
                  pathname: "/community/user/connections",
                  params: {
                    id: user?.id || socialProfile?.id,
                    initialTab: "followers",
                    name: fullNameDisplay,
                  },
                } as any);
              }}
              style={styles.statCounterItem}
            >
              <Text style={[styles.statBold, { color: textPrimary }]}>
                {connectsCount}
              </Text>
              <Text style={[styles.statMuted, { color: textSecondary }]}>
                Followers
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveTab("posts");
              }}
              style={styles.statCounterItem}
            >
              <Text style={[styles.statBold, { color: textPrimary }]}>
                {authorPosts.length}
              </Text>
              <Text style={[styles.statMuted, { color: textSecondary }]}>
                Reflections
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Profile Tabs Sub-Navigation Bar */}
        <View
          style={[
            styles.tabsBarWrap,
            {
              backgroundColor: cardBg,
              borderBottomColor: cardBorder,
              borderTopColor: cardBorder,
            },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {PROFILE_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setActiveTab(tab.key);
                  }}
                  style={[
                    styles.tabButton,
                    isActive && styles.tabButtonActive,
                  ]}
                >
                  <View style={styles.tabContentRow}>
                    <Ionicons
                      name={tab.icon}
                      size={16}
                      color={isActive ? PRIMARY : textTertiary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.tabLabelText,
                        {
                          color: isActive ? textPrimary : textTertiary,
                          fontWeight: isActive ? "800" : "600",
                        },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </View>
                  {isActive && (
                    <View
                      style={[
                        styles.activeTabIndicator,
                        { backgroundColor: PRIMARY },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Content Body */}
        <View style={styles.tabBodyWrap}>
          {renderTabContent()}
        </View>
      </ScrollView>

      {/* Floating Action Button (Twitter style: Write Reflection) */}
      {activeTab === "posts" && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
              () => {}
            );
            router.push("/community/compose" as any);
          }}
          accessibilityRole="button"
          accessibilityLabel="Compose New Reflection"
          style={({ pressed }) => [
            styles.floatingComposeBtn,
            {
              backgroundColor: PRIMARY,
              bottom: insets.bottom + 75,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons name="add" size={26} color="#ffffff" />
        </Pressable>
      )}

      {/* Senior-Engineered Native Bottom Action Sheet for Avatar & Banner */}
      <Modal
        visible={imageSheetTarget !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImageSheetTarget(null)}
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setImageSheetTarget(null)}>
          <View style={styles.sheetBackdrop}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.sheetContainer,
                  {
                    backgroundColor: isDark ? "#18181b" : "#ffffff",
                    borderColor: isDark ? "#27272a" : "#e4e4e7",
                    paddingBottom: Math.max(insets.bottom, 20),
                  },
                ]}
              >
                {/* Drag Indicator */}
                <View style={styles.sheetHandleWrap}>
                  <View
                    style={[
                      styles.sheetHandle,
                      { backgroundColor: isDark ? "#3f3f46" : "#d4d4d8" },
                    ]}
                  />
                </View>

                {/* Title & Description */}
                <Text style={[styles.sheetTitle, { color: textPrimary }]}>
                  {imageSheetTarget === "avatar"
                    ? "Profile Photo"
                    : "Header Banner"}
                </Text>
                <Text style={[styles.sheetSubtitle, { color: textSecondary }]}>
                  {imageSheetTarget === "avatar"
                    ? "Capture a new 1:1 picture or select from your gallery"
                    : "Select a 3:1 panoramic photo for your profile header"}
                </Text>

                {/* Options List */}
                <View style={styles.sheetOptionsList}>
                  {/* Take Photo */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (imageSheetTarget) {
                        handlePickImage(imageSheetTarget, "camera");
                      }
                    }}
                    style={[
                      styles.sheetOptionBtn,
                      {
                        backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                        borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.sheetOptionIconWrap,
                        { backgroundColor: `${PRIMARY}18` },
                      ]}
                    >
                      <Ionicons name="camera-outline" size={20} color={PRIMARY} />
                    </View>
                    <View style={styles.sheetOptionTextCol}>
                      <Text
                        style={[styles.sheetOptionLabel, { color: textPrimary }]}
                      >
                        Take Photo
                      </Text>
                      <Text
                        style={[styles.sheetOptionHint, { color: textSecondary }]}
                      >
                        {imageSheetTarget === "avatar"
                          ? "Take a photo with 1:1 square crop"
                          : "Take a photo with 3:1 panoramic crop"}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={textTertiary}
                    />
                  </TouchableOpacity>

                  {/* Choose from Library */}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      if (imageSheetTarget) {
                        handlePickImage(imageSheetTarget, "library");
                      }
                    }}
                    style={[
                      styles.sheetOptionBtn,
                      {
                        backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                        borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.sheetOptionIconWrap,
                        { backgroundColor: `${PRIMARY}18` },
                      ]}
                    >
                      <Ionicons name="images-outline" size={20} color={PRIMARY} />
                    </View>
                    <View style={styles.sheetOptionTextCol}>
                      <Text
                        style={[styles.sheetOptionLabel, { color: textPrimary }]}
                      >
                        Choose from Library
                      </Text>
                      <Text
                        style={[styles.sheetOptionHint, { color: textSecondary }]}
                      >
                        Select from your device and crop
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={textTertiary}
                    />
                  </TouchableOpacity>

                  {/* View Full Photo (Avatar or Cover Banner) */}
                  {((imageSheetTarget === "avatar" && Boolean(avatarUri)) ||
                    (imageSheetTarget === "banner" && Boolean(bannerUri))) && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        const targetImg =
                          imageSheetTarget === "avatar"
                            ? avatarUri
                            : bannerUri;
                        setImageSheetTarget(null);
                        if (targetImg) {
                          setLightboxImage({
                            uri:
                              typeof targetImg === "string"
                                ? targetImg
                                : (targetImg as any)?.uri,
                            caption:
                              imageSheetTarget === "avatar"
                                ? fullNameDisplay
                                : "Fellowship Profile Banner",
                            author: fullNameDisplay,
                          });
                        }
                      }}
                      style={[
                        styles.sheetOptionBtn,
                        {
                          backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                          borderColor: isDark ? "#3f3f46" : "#e4e4e7",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.sheetOptionIconWrap,
                          {
                            backgroundColor: isDark ? "#3f3f46" : "#e2e8f0",
                          },
                        ]}
                      >
                        <Ionicons
                          name="eye-outline"
                          size={20}
                          color={textPrimary}
                        />
                      </View>
                      <View style={styles.sheetOptionTextCol}>
                        <Text
                          style={[
                            styles.sheetOptionLabel,
                            { color: textPrimary },
                          ]}
                        >
                          {imageSheetTarget === "avatar"
                            ? "View Profile Photo"
                            : "View Cover Photo"}
                        </Text>
                        <Text
                          style={[
                            styles.sheetOptionHint,
                            { color: textSecondary },
                          ]}
                        >
                          {imageSheetTarget === "avatar"
                            ? "Preview full-resolution avatar"
                            : "Preview full-resolution banner"}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={textTertiary}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Cancel Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setImageSheetTarget(null)}
                  style={[
                    styles.sheetCancelBtn,
                    {
                      backgroundColor: isDark ? "#27272a" : "#f1f5f9",
                      borderColor: isDark ? "#3f3f46" : "#e2e8f0",
                    },
                  ]}
                >
                  <Text style={[styles.sheetCancelText, { color: textPrimary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Full Resolution Image Lightbox Modal */}
      <ImageViewerModal
        visible={Boolean(lightboxImage)}
        imageUri={lightboxImage?.uri || null}
        caption={lightboxImage?.caption}
        authorName={lightboxImage?.author}
        onClose={() => setLightboxImage(null)}
      />

      {/* Day Streak Modal */}
      <StreakModal
        visible={streakModalVisible}
        onClose={() => setStreakModalVisible(false)}
      />

      {/* Delete Reflection Confirmation Modal */}
      <ConfirmModal
        visible={Boolean(deletePostId)}
        onClose={() => setDeletePostId(null)}
        isDark={isDark}
        icon="trash-outline"
        iconColor="#ef4444"
        title="Delete Reflection"
        description="Are you sure you want to permanently delete this reflection?"
        buttons={[
          {
            label: "Delete",
            onPress: handleConfirmDeletePost,
            variant: "danger",
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmModal
        visible={signOutConfirm}
        onClose={() => setSignOutConfirm(false)}
        isDark={isDark}
        icon="log-out-outline"
        iconColor="#ef4444"
        title="Sign Out"
        description="Are you sure you want to sign out of your 4 Kilo Fellowship account on this device?"
        buttons={[
          {
            label: "Sign Out",
            onPress: handleSignOut,
            variant: "danger",
          },
        ]}
        cancelButton={{ label: "Cancel" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bannerWrap: {
    width: SCREEN_WIDTH,
    height: 140,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerEmptyDoom: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.12)",
  },
  bannerEditBtn: {
    position: "absolute",
    top: 12,
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 20,
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bannerEditText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  bannerLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    zIndex: 20,
  },
  bannerLoadingText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  profileActionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: -40,
    marginBottom: 8,
    zIndex: 10,
  },
  avatarWrap: {
    position: "relative",
  },
  avatarRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitialText: {
    fontSize: 32,
    fontWeight: "800",
    color: PRIMARY,
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  topActionBtnsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
    flexShrink: 0,
  },
  secondaryPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 9999,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  secondaryPillText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  primaryPillBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    height: 40,
    borderRadius: 9999,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  primaryPillText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  identityContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 10,
  },
  nameLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  displayName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  handleLine: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 1,
  },
  handleAndStreakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
    flexWrap: "wrap",
  },
  badgesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: "700",
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    marginTop: 4,
    marginBottom: 10,
  },
  bioPlaceholderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 8,
  },
  bioPlaceholderText: {
    fontSize: 13,
    fontWeight: "500",
  },
  metadataList: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 7,
    marginTop: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsStripRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statCounterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statBold: {
    fontSize: 14,
    fontWeight: "800",
  },
  statMuted: {
    fontSize: 13,
    fontWeight: "500",
  },
  tabsBarWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  tabsScroll: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    position: "relative",
    alignItems: "center",
  },
  tabButtonActive: {},
  tabContentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabLabelText: {
    fontSize: 14,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 1.5,
  },
  tabBodyWrap: {
    paddingTop: 8,
  },
  loadingStateWrap: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingStateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  postsList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 12,
  },
  postCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  postCardRow: {
    flexDirection: "row",
    gap: 12,
  },
  postBody: {
    flex: 1,
  },
  postAuthorLine: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  postAuthorName: {
    fontSize: 14,
    fontWeight: "700",
    flexShrink: 1,
  },
  postHandleText: {
    fontSize: 12,
    marginLeft: 4,
    flexShrink: 2,
  },
  postTimeText: {
    fontSize: 12,
    marginLeft: 2,
    flexShrink: 0,
  },
  postDeleteBtn: {
    marginLeft: "auto",
    paddingLeft: 8,
    paddingVertical: 2,
  },
  postContentText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    marginBottom: 10,
  },
  postImageWrap: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 10,
    aspectRatio: 16 / 9,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 16,
    paddingTop: 2,
  },
  postActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  postActionCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyStateCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    textAlign: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  emptyCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyCtaText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  mediaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  mediaGridCell: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 0.5,
  },
  mediaGridImage: {
    width: "100%",
    height: "100%",
  },
  mediaLikesBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mediaLikesText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  ministryTabWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ministryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ministryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  ministryTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  ministrySub: {
    fontSize: 12,
    fontWeight: "500",
  },
  teamActionBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${PRIMARY}14`,
  },
  teamActionText: {
    fontSize: 11,
    fontWeight: "700",
    color: PRIMARY,
  },
  ministryDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scheduleName: {
    fontSize: 13,
    fontWeight: "700",
  },
  scheduleMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  accountTabWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    minHeight: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  menuItemIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
  },
  signOutText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
  },
  floatingComposeBtn: {
    position: "absolute",
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
    zIndex: 20,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandleWrap: {
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 8,
  },
  sheetHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 2.5,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  sheetOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  sheetOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sheetOptionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetOptionTextCol: {
    flex: 1,
  },
  sheetOptionLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  sheetOptionHint: {
    fontSize: 12,
  },
  sheetCancelBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  accountFooter: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginTop: 8,
  },
  footerFellowshipText: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  footerVersionText: {
    fontSize: 12,
  },
});
