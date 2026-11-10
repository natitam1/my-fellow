import SignInPromptModal from "@/components/SignInPromptModal";
import { NativeBackButton, Placeholder } from "@/components";
import { PRIMARY } from "@/constants";
import { OFFLINE_DEVOTIONS } from "@/constants/offlineDevotions";
import {
  getBundledOfflineAudio,
  resolveDevotionAudioSource,
} from "@/constants/offlineAudio";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { devotionsService } from "@/services/devotionsService";
import { useDevotionsStore } from "@/stores/devotions.store";
import { useStreakStore } from "@/stores/streak.store";
import { Devotion } from "@/types/devotion.types";
import {
  navigateToDevotionAuthor,
  resolveDevotionActor,
} from "@/utils/devotionActor";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import {
  AudioSource,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useState } from "react";
import {
  GestureResponderEvent,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DevotionDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { top, bottom } = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isAdmin = useIsAdmin();

  const { markAsRead, savedDevotions, cacheDevotion, getCachedDevotion } =
    useDevotionsStore();

  const cachedDevotion = useMemo(() => getCachedDevotion(id), [id, getCachedDevotion]);

  const [devotion, setDevotion] = useState<Devotion | null>(cachedDevotion || null);
  const [allDevotions, setAllDevotions] = useState<Devotion[]>(() => {
    const list = useDevotionsStore.getState().devotionsList;
    return list && list.length > 0 ? list : OFFLINE_DEVOTIONS;
  });
  const [loading, setLoading] = useState<boolean>(!cachedDevotion);
  const [isLiked, setIsLiked] = useState<boolean>(cachedDevotion?.isLiked || false);
  const [likesCount, setLikesCount] = useState<number | string>(
    cachedDevotion?.likesFormatted || cachedDevotion?.likes || 0,
  );
  const [viewsCount, setViewsCount] = useState<number | string>(
    cachedDevotion?.viewsFormatted || cachedDevotion?.views || 0,
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(1);
  const [bannerLoaded, setBannerLoaded] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  useEffect(() => {
    setBannerLoaded(false);
    setBannerError(false);
  }, [id, devotion?.image]);

  // Synchronously compute initial audio source from bundled assets or devotion audioUrl
  const initialAudioSource = useMemo<AudioSource>(() => {
    const bundled = getBundledOfflineAudio(
      cachedDevotion?._id,
      cachedDevotion?.title,
    );
    if (bundled) return bundled;
    return cachedDevotion?.audioUrl || null;
  }, [cachedDevotion?._id, cachedDevotion?.title, cachedDevotion?.audioUrl]);

  const [audioSource, setAudioSource] = useState<AudioSource>(initialAudioSource);
  const { authState } = useAuth();
  const actor = useMemo(() => resolveDevotionActor(devotion), [devotion]);

  useEffect(() => {
    if (cachedDevotion) {
      setDevotion(cachedDevotion);
      setIsLiked(cachedDevotion.isLiked || false);
      setLikesCount(cachedDevotion.likesFormatted || cachedDevotion.likes);
      setViewsCount(cachedDevotion.viewsFormatted || cachedDevotion.views);
      setLoading(false);
    }
  }, [cachedDevotion]);

  // Resolve best offline/local audio source (downloaded file > bundled asset > remote)
  useEffect(() => {
    if (!devotion?._id || devotion.type !== "voice") return;
    let isMounted = true;
    resolveDevotionAudioSource(devotion).then((resolved) => {
      if (isMounted && resolved) {
        setAudioSource(resolved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [devotion?._id, devotion?.title, devotion?.type, devotion?.audioUrl]);

  // Configure Expo SDK 58 native audio session mode
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch((err) => console.log("Audio mode set error:", err));
  }, []);

  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    return () => {
      try {
        player.pause();
        player.setActiveForLockScreen(false);
        player.clearLockScreenControls();
      } catch {}
    };
  }, [player]);

  const togglePlayPause = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    if (status.playing) {
      player.pause();
    } else {
      if (devotion && devotion.type === "voice") {
        player.setActiveForLockScreen(
          true,
          {
            title: devotion.title,
            artist: actor.displayName,
            albumTitle: "4 Kilo Fellowship Devotions",
            artworkUrl: devotion.image,
          },
          {
            showSeekForward: true,
            showSeekBackward: true,
            seekForwardIntervalSeconds: 10,
            seekBackwardIntervalSeconds: 10,
          },
        );
      }
      if (status.didJustFinish) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  useEffect(() => {
    if (status.didJustFinish) {
      player.setActiveForLockScreen(false);
      player.seekTo(0);
    }
  }, [status.didJustFinish, player]);

  const handleSeekPress = (e: GestureResponderEvent) => {
    if (status.duration > 0 && progressBarWidth > 0) {
      const clickX = e.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, clickX / progressBarWidth));
      player.seekTo(ratio * status.duration);
    }
  };

  useEffect(() => {
    const loadDevotion = async () => {
      try {
        const response = await devotionsService.getDevotionById(id);
        if (response.success) {
          setDevotion(response.data);
          cacheDevotion(response.data);
          setIsLiked(response.data.isLiked || false);
          setLikesCount(response.data.likesFormatted || response.data.likes);
          setViewsCount(response.data.viewsFormatted || response.data.views);
          markAsRead(id);
          useStreakStore.getState().recordDevotionRead();

          devotionsService.trackView(id).then((viewRes) => {
            if (viewRes.success) {
              setViewsCount(viewRes.data.viewsFormatted);
              cacheDevotion({
                ...response.data,
                viewsFormatted: viewRes.data.viewsFormatted,
              });
            }
          });

          if (response.data.type === "voice" && response.data.audioUrl) {
            downloadForOffline(response.data);
          }
        }

        try {
          const allResponse = await devotionsService.getDevotions();
          if (allResponse.success && Array.isArray(allResponse.data)) {
            setAllDevotions(allResponse.data);
          }
        } catch {}
      } catch (error) {
        console.log("Device offline or error loading devotion details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDevotion();
  }, [id]);

  const downloadForOffline = async (item: Devotion) => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const folder = `${FileSystem.documentDirectory}devotions/${item._id}/`;
      await FileSystem.makeDirectoryAsync(folder, { intermediates: true });

      let totalFiles = 0;
      if (item.image) totalFiles++;
      const mediaUrl = item.audioUrl;
      if (mediaUrl) totalFiles++;

      let completedFiles = 0;

      const onProgress = (downloadProgress: {
        totalBytesWritten: number;
        totalBytesExpectedToWrite: number;
      }) => {
        if (downloadProgress.totalBytesExpectedToWrite > 0) {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          const overallProgress =
            (completedFiles / totalFiles + progress / totalFiles) * 100;
          setDownloadProgress(Math.min(overallProgress, 100));
        }
      };

      if (item.image) {
        const imageFile = folder + "image.jpg";
        const imageInfo = await FileSystem.getInfoAsync(imageFile);
        if (!imageInfo.exists) {
          const downloadResumable = FileSystem.createDownloadResumable(
            item.image,
            imageFile,
            {},
            onProgress,
          );
          await downloadResumable.downloadAsync();
        }
        completedFiles++;
        setDownloadProgress((completedFiles / totalFiles) * 100);
      }

      if (mediaUrl) {
        const mediaFile = folder + "audio.mp3";
        const mediaInfo = await FileSystem.getInfoAsync(mediaFile);
        if (!mediaInfo.exists) {
          const downloadResumable = FileSystem.createDownloadResumable(
            mediaUrl,
            mediaFile,
            {},
            onProgress,
          );
          await downloadResumable.downloadAsync();
        }
        if (!status.playing && status.currentTime === 0) {
          setAudioSource(mediaFile);
        }
        completedFiles++;
        setDownloadProgress((completedFiles / totalFiles) * 100);
      }
    } catch (error) {
      console.error("Error downloading for offline:", error);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(100);
    }
  };

  const relatedDevotions = useMemo(() => {
    if (!devotion || !allDevotions.length) return [];
    return allDevotions
      .filter(
        (d) =>
          d._id !== devotion._id &&
          d.tags.some((tag) => devotion.tags.includes(tag)),
      )
      .slice(0, 3);
  }, [devotion, allDevotions]);

  const handleLike = async () => {
    if (!authState?.authenticated) {
      setShowSignInModal(true);
      return;
    }

    const action = isLiked ? "unlike" : "like";

    try {
      const response = await devotionsService.likeDevotion(id, action);
      if (response.success) {
        setIsLiked(!isLiked);
        setLikesCount(response.data.likesFormatted);
      }
    } catch (error) {
      console.error("Error liking devotion:", error);
    }
  };

  const handleShare = async () => {
    if (!devotion) return;
    try {
      await Share.share({
        message: `Devotion: ${devotion.title}\nBy ${actor.displayName}\n\nRead more in My Fellow app!`,
        url: devotion.image,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const openLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening link:", error);
    }
  };

  const formatTime = (secs: number) => {
    const totalSeconds = Math.floor(secs);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleAuthorPress = () => {
    if (!devotion) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    navigateToDevotionAuthor(devotion, router);
  };

  if (loading && !devotion) {
    return (
      <View className={`flex-1 ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Minimal Header Skeleton */}
        <View
          className={`flex-row items-center justify-between px-5 ${
            isDark ? "bg-[#0a0a0a]" : "bg-white"
          }`}
          style={{
            paddingTop: top + 6,
            paddingBottom: 12,
          }}
        >
          <NativeBackButton size={38} />
          <Placeholder width={140} height={18} borderRadius={6} />
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8 }}
        >
          {/* Cover Image Placeholder */}
          <View className="w-full h-[260px]">
            <Placeholder width="100%" height={260} borderRadius={0} />
          </View>

          {/* Article Info Placeholder */}
          <View className="px-5 pt-6">
            <Placeholder width="90%" height={26} borderRadius={6} style={{ marginBottom: 10 }} />
            <Placeholder width="65%" height={24} borderRadius={6} style={{ marginBottom: 20 }} />

            {/* Author Row Placeholder */}
            <View
              className={`flex-row items-center justify-between pb-4 mb-6 border-b ${
                isDark ? "border-[#1a1a1a]" : "border-gray-100"
              }`}
            >
              <View className="flex-row items-center flex-1">
                <Placeholder width={40} height={40} borderRadius={20} />
                <View style={{ marginLeft: 10, flex: 1, gap: 5 }}>
                  <Placeholder width={110} height={14} borderRadius={4} />
                  <Placeholder width={70} height={11} borderRadius={4} />
                </View>
              </View>
              <Placeholder width={56} height={32} borderRadius={16} />
            </View>

            {/* Body Text Lines Placeholder */}
            <Placeholder width="100%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="96%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="92%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="98%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="80%" height={14} borderRadius={4} style={{ marginBottom: 24 }} />

            <Placeholder width="100%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="94%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
            <Placeholder width="88%" height={14} borderRadius={4} style={{ marginBottom: 10 }} />
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!devotion) {
    return (
      <View
        className={`flex-1 items-center justify-center ${isDark ? "bg-zinc-950" : "bg-gray-50"}`}
      >
        <Text className={isDark ? "text-white" : "text-black"}>
          Devotion not found
        </Text>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.back()}
          className="mt-4 px-6 py-2 bg-primary rounded-full"
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View
        className={`absolute z-20 w-full flex-row items-center justify-between px-5 ${
          isDark ? "bg-[#0a0a0a]" : "bg-white"
        }`}
        style={{
          paddingTop: top + 6,
          paddingBottom: 12,
        }}
      >
        <NativeBackButton size={38} />

        <Text
          numberOfLines={1}
          className={`text-[15px] font-bold flex-1 text-center mx-3 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {devotion.title}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => router.push(`/devotion/manage?id=${devotion._id || id}`)}
              className="w-9 h-9 rounded-full items-center justify-center bg-orange-500/10"
            >
              <Ionicons name="pencil" size={18} color="#ff6719" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleShare}
            className="w-9 h-9 rounded-full items-center justify-center"
          >
            <Ionicons
              name="share-social-outline"
              size={20}
              color={isDark ? "#fff" : "#111"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: top + 52 }}
      >
        <View
          style={{ width: "100%", height: 280, position: "relative" }}
          className={`w-full h-[280px] overflow-hidden items-center justify-center ${
            isDark ? "bg-[#141416]" : "bg-gray-100"
          }`}
        >
          {!bannerLoaded && !bannerError && (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              <Placeholder width="100%" height={280} borderRadius={0} />
            </View>
          )}
          <ExpoImage
            source={
              !bannerError && devotion.image
                ? typeof devotion.image === "string"
                  ? { uri: devotion.image }
                  : (devotion.image as any)
                : require("@/assets/images/onboarding-devotion.jpg")
            }
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            onLoad={() => setBannerLoaded(true)}
            onError={() => {
              setBannerError(true);
              setBannerLoaded(true);
            }}
          />
        </View>

        <View className="px-5 pt-6">
          <Text
            className={`text-[26px] font-extrabold leading-[33px] mb-4 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {devotion.title}
          </Text>

          <View
            className={`flex-row items-center justify-between pb-4 mb-6 border-b ${
              isDark ? "border-[#1a1a1a]" : "border-gray-100"
            }`}
          >
            {/* Author Profile */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAuthorPress}
              className="flex-row items-center flex-1 mr-4"
            >
              <View
                className={`w-10 h-10 rounded-full overflow-hidden items-center justify-center ${
                  isDark ? "bg-[#1f1f23]" : "bg-gray-100"
                }`}
              >
                {actor.avatarUrl ? (
                  <ExpoImage
                    source={{ uri: actor.avatarUrl }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons
                    name={actor.type === "team" ? "people" : "person"}
                    size={18}
                    color={PRIMARY}
                  />
                )}
              </View>

              <View style={{ marginLeft: 11, flex: 1, justifyContent: "center" }}>
                <View className="flex-row items-center">
                  <Text
                    className={`text-[15px] font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                    numberOfLines={1}
                  >
                    {actor.displayName}
                  </Text>
                  {actor.isVerified && (
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color="#0284c7"
                      style={{ marginLeft: 4 }}
                    />
                  )}
                  {actor.badgeText && (
                    <View
                      className={`ml-1.5 px-1.5 py-0.5 rounded-md ${
                        actor.type === "team"
                          ? "bg-emerald-500/15"
                          : isDark
                          ? "bg-primary/20"
                          : "bg-primary/10"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold tracking-wider ${
                          actor.type === "team"
                            ? "text-emerald-500"
                            : "text-primary"
                        }`}
                      >
                        {actor.badgeText}
                      </Text>
                    </View>
                  )}
                </View>
                <Text
                  className={`text-[12px] font-medium mt-0.5 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {actor.role}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Like Button */}
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleLike}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              className="flex-row items-center py-1.5 px-2"
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#ef4444" : isDark ? "#888888" : "#71717a"}
              />
              <Text
                className={`text-[13px] font-semibold ml-1.5 ${
                  isLiked
                    ? "text-[#ef4444]"
                    : isDark
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                {likesCount}
              </Text>
            </TouchableOpacity>
          </View>

          {devotion.type === "voice" && (
            <View
              className={`mb-6 p-5 rounded-2xl border ${
                isDark
                  ? "bg-[#141416] border-[#222]"
                  : "bg-[#f8f9fa] border-gray-200"
              }`}
            >
              {/* Audio Player Header */}
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2.5">
                    <Ionicons name="musical-notes" size={16} color={PRIMARY} />
                  </View>
                  <View>
                    <Text
                      className={`text-[13px] font-bold ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Audio Devotion & Message
                    </Text>
                    <Text
                      className={`text-[11px] ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {devotion.duration || "Voice with Caption"}
                    </Text>
                  </View>
                </View>

                {status.playing && (
                  <View className="flex-row items-center bg-primary/15 px-2.5 py-1 rounded-full">
                    <Ionicons name="volume-high" size={13} color={PRIMARY} />
                    <Text className="text-[10px] font-bold text-primary ml-1">
                      Playing
                    </Text>
                  </View>
                )}
              </View>

              {/* Progress Bar (Scrubbable) */}
              <View
                className="w-full mb-3"
                onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
              >
                <Pressable
                  hitSlop={12}
                  onPress={handleSeekPress}
                  className={`h-2.5 w-full rounded-full overflow-hidden ${
                    isDark ? "bg-[#252528]" : "bg-gray-200"
                  } justify-center`}
                >
                  <View
                    pointerEvents="none"
                    style={{
                      width:
                        status.duration > 0
                          ? `${Math.min(100, Math.max(0, (status.currentTime / status.duration) * 100))}%`
                          : "0%",
                    }}
                    className="h-full bg-primary rounded-full"
                  />
                </Pressable>
                <View className="flex-row justify-between mt-1.5">
                  <Text
                    className={`text-[11px] font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatTime(status.currentTime)}
                  </Text>
                  <Text
                    className={`text-[11px] font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {devotion.duration || formatTime(status.duration)}
                  </Text>
                </View>
              </View>

              {/* Player Controls */}
              <View className="flex-row items-center justify-center pt-1" style={{ gap: 24 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    player.seekTo(Math.max(0, status.currentTime - 10));
                  }}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isDark ? "bg-[#222]" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name="play-back"
                    size={18}
                    color={isDark ? "#ccc" : "#555"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={togglePlayPause}
                  className="w-14 h-14 bg-primary rounded-full items-center justify-center shadow-md shadow-primary/30"
                >
                  <Ionicons
                    name={status.playing ? "pause" : "play"}
                    size={26}
                    color="white"
                    style={!status.playing ? { marginLeft: 3 } : undefined}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    try {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } catch {}
                    const targetTime =
                      status.duration > 0
                        ? Math.min(status.duration, status.currentTime + 10)
                        : status.currentTime + 10;
                    player.seekTo(targetTime);
                  }}
                  className={`w-10 h-10 rounded-full items-center justify-center ${
                    isDark ? "bg-[#222]" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name="play-forward"
                    size={18}
                    color={isDark ? "#ccc" : "#555"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Devotion Content & Caption */}
          <View className="mb-8">
            {devotion.type === "voice" && (
              <View className="flex-row items-center mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800">
                <Ionicons name="document-text-outline" size={17} color={PRIMARY} />
                <Text
                  className={`text-[15px] font-bold ml-2 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Full Message & Reflection
                </Text>
              </View>
            )}

            {/* Always display the full devotion text */}
            {(devotion.content || devotion.caption) && (
              <Markdown
                style={{
                  body: {
                    color: isDark ? "#d1d5db" : "#374151",
                    fontSize: 16.5,
                    lineHeight: 29,
                  },
                  paragraph: {
                    marginBottom: 18,
                  },
                  heading2: {
                    color: isDark ? "#f9fafb" : "#111827",
                    fontSize: 22,
                    fontWeight: "800",
                    marginTop: 28,
                    marginBottom: 12,
                    lineHeight: 30,
                  },
                  heading3: {
                    color: isDark ? "#e5e7eb" : "#1f2937",
                    fontSize: 18,
                    fontWeight: "700",
                    marginTop: 24,
                    marginBottom: 10,
                    lineHeight: 26,
                  },
                  strong: {
                    fontWeight: "700",
                    color: isDark ? "#f3f4f6" : "#111827",
                  },
                  em: {
                    fontStyle: "italic",
                    color: isDark ? "#d1d5db" : "#4b5563",
                  },
                  blockquote: {
                    backgroundColor: isDark ? "#141416" : "#f9fafb",
                    borderLeftColor: PRIMARY,
                    borderLeftWidth: 3,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderRadius: 8,
                    marginVertical: 16,
                  },
                  hr: {
                    backgroundColor: isDark ? "#1a1a1a" : "#e5e7eb",
                    height: 1,
                    marginVertical: 24,
                  },
                  list_item: {
                    marginBottom: 6,
                  },
                  bullet_list: {
                    marginBottom: 16,
                  },
                  ordered_list: {
                    marginBottom: 16,
                  },
                }}
              >
                {devotion.content || devotion.caption || ""}
              </Markdown>
            )}
          </View>

          {relatedDevotions.length > 0 && (
            <View className="mb-8">
              <Text
                className={`text-[18px] font-bold mb-4 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Related
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-5 px-5"
              >
                {relatedDevotions.map((item) => (
                  <View
                    key={item._id}
                    className="mr-3 w-52 rounded-2xl overflow-hidden"
                  >
                    <Pressable
                      android_ripple={{
                        color: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                        foreground: true,
                      }}
                      style={({ pressed }) => [
                        Platform.OS === "ios" && pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                      ]}
                      onPress={() => router.push(`/devotion/${item._id}`)}
                    >
                      <View
                        className={`h-32 w-full rounded-xl overflow-hidden mb-2 border ${
                          isDark ? "border-[#1a1a1a] bg-[#141414]" : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <ExpoImage
                          source={{ uri: item.image }}
                          style={{ width: "100%", height: "100%" }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={200}
                        />
                      </View>
                      <Text
                        numberOfLines={2}
                        className={`text-[14px] font-bold leading-tight ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className={`text-[11px] mt-1 ${
                          isDark ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {resolveDevotionActor(item).displayName}
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: bottom + 20 }} />
        </View>
      </ScrollView>

      <SignInPromptModal
        visible={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSignIn={() => {
          setShowSignInModal(false);
          router.push("/(auth)/sign-in");
        }}
        message="Sign in to like this devotion and save it to your favorites."
      />
    </View>
  );
};

export default DevotionDetail;
