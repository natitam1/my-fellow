import { PRIMARY } from "@/constants";
import { AppBottomSheet } from "@/components/AppBottomSheet";
import { NativeBackButton } from "@/components/ui/NativeBackButton";
import { useConfirmUnsavedChanges } from "@/hooks/useConfirmUnsavedChanges";
import { useTheme } from "@/context/ThemeContext";
import { useCommunityStore } from "@/stores/community.store";
import { useUserStore } from "@/stores/user.store";
import { getPrefilledAvatar } from "@/utils/avatar";
import { PostableActor } from "@/types/social.types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const AUDIENCES = [
  { id: "everyone", label: "Everyone", description: "Anyone on 4 Kilo Fellowship" },
  { id: "fellowship", label: "Fellowship Members", description: "Verified fellowship students" },
  { id: "team", label: "My Ministry Team", description: "Members in your assigned ministry" },
] as const;

export default function ComposePostScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { user } = useUserStore();
  const createPost = useCommunityStore((s) => s.createPost);
  const postableActors = useCommunityStore((s) => s.postableActors);
  const fetchPostableActors = useCommunityStore((s) => s.fetchPostableActors);

  const [content, setContent] = useState("");
  const [pickedImageUri, setPickedImageUri] = useState<string | null>(null);
  const [selectedAudience] = useState<string>("everyone");
  const [selectedActor, setSelectedActor] = useState<PostableActor | null>(null);
  const [actorPickerVisible, setActorPickerVisible] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasPostedSuccessfully, setHasPostedSuccessfully] = useState(false);
  const hasPostedRef = useRef(false);
  const inputRef = useRef<TextInputInstance | null>(null);

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#f1f5f9";
  const bg = isDark ? "#09090b" : "#ffffff";

  const userAvatar =
    user?.profileImage ||
    getPrefilledAvatar(user?.phoneNumber || user?.id);

  const fullName = user?.fullName;
  const telegramUserName = user?.telegramUserName;
  const userPersonalActor: PostableActor = useMemo(
    () => ({
      id: "me",
      type: "user",
      displayName: fullName || "Personal Account",
      handle: telegramUserName
        ? telegramUserName.replace(/^@/, "")
        : (fullName || "me").toLowerCase().replace(/\s+/g, ""),
      avatarUrl: userAvatar,
      bio: null,
      isVerified: false,
    }),
    [fullName, telegramUserName, userAvatar],
  );

  const availableActors: PostableActor[] = useMemo(() => {
    if (!postableActors || postableActors.length === 0) {
      return [userPersonalActor];
    }
    const hasMe = postableActors.some((a) => a.id === "me" || a.type === "user");
    if (!hasMe) {
      return [userPersonalActor, ...postableActors];
    }
    return postableActors;
  }, [postableActors, userPersonalActor]);

  const activeActor = selectedActor || availableActors[0] || userPersonalActor;

  useEffect(() => {
    fetchPostableActors().then((actors) => {
      if (actors && actors.length > 0) {
        setSelectedActor((prev) => prev || actors[0]);
      }
    });
  }, [fetchPostableActors]);

  const charLimit = 500;
  const charsLeft = charLimit - content.length;
  const isOverLimit = charsLeft < 0;
  const hasContent = (!!content.trim() || !!pickedImageUri) && !isOverLimit;

  const hasUnsavedChanges =
    !hasPostedRef.current &&
    !hasPostedSuccessfully &&
    !submitting &&
    (content.trim().length > 0 || !!pickedImageUri);

  const { bypassAndNavigate } = useConfirmUnsavedChanges(hasUnsavedChanges, {
    title: "Discard draft?",
    message: "You have an unsaved fellowship post that will be lost.",
    discardLabel: "Discard",
    continueLabel: "Keep Editing",
    isBypassed: () => hasPostedRef.current,
  });

  const handlePost = async () => {
    if (!content.trim() && !pickedImageUri) return;

    try {
      setSubmitting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

      const finalContent = hasLocation && !content.includes("📍")
        ? `${content.trim()}\n\n📍 4 Kilo Campus, AAU`
        : content.trim();

      await createPost({
        body: finalContent,
        kind: "post",
        image: pickedImageUri ? { uri: pickedImageUri } : null,
        author: user,
        authorActorId: activeActor && activeActor.id !== "me" ? activeActor.id : undefined,
        authorActor: activeActor || undefined,
      });

      // Mark as posted in ref and state to permanently prevent discard modal
      hasPostedRef.current = true;
      setHasPostedSuccessfully(true);
      setContent("");
      setPickedImageUri(null);

      Keyboard.dismiss();

      bypassAndNavigate(() => {
        router.back();
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Could not publish post. Please check your connection and try again.";
      Alert.alert("Unable to Post", message);
    } finally {
      setSubmitting(false);
    }
  };

  const showComingSoonToast = useCallback((featureName?: string) => {
    Haptics.selectionAsync().catch(() => {});
    if (Platform.OS === "android") {
      ToastAndroid.showWithGravity(
        featureName ? `${featureName} coming soon` : "Coming soon",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
    Toast.show({
      type: "info",
      text1: "Coming Soon",
      text2: featureName
        ? `${featureName} will be available in a future update.`
        : "This feature will be available in a future update.",
      position: "bottom",
      bottomOffset: 80,
    });
  }, []);

  const currentAudienceObj =
    AUDIENCES.find((a) => a.id === selectedAudience) || AUDIENCES[0];

  const handleDismiss = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={["top", "bottom"]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Top Bar with circular close button and action button */}
      <View style={[styles.topBar, { borderBottomColor: borderColor }]}>
        <NativeBackButton
          iconName="close"
          iconSize={24}
          onPress={handleDismiss}
          accessibilityLabel="Close compose screen"
        />

        <Pressable
          onPress={handlePost}
          disabled={!hasContent || submitting}
          accessibilityRole="button"
          accessibilityLabel="Publish post"
          android_ripple={{
            color: "rgba(255, 255, 255, 0.3)",
            borderless: false,
          }}
          style={[
            styles.postBtn,
            {
              backgroundColor: hasContent
                ? PRIMARY
                : isDark
                  ? "rgba(255, 103, 25, 0.35)"
                  : "rgba(255, 103, 25, 0.45)",
            },
          ]}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.contentWrap}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          {/* User Row + Actor Identity + Audience Picker */}
          <View style={styles.userRow}>
            <ExpoImage
              source={{ uri: activeActor?.avatarUrl || userAvatar }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />

            <View style={styles.authorMetaCol}>
              <View style={styles.authorNameRow}>
                <Text style={[styles.authorDisplayName, { color: textColor }]} numberOfLines={1}>
                  {activeActor && activeActor.id !== "me"
                    ? activeActor.displayName
                    : user?.fullName || "Personal Account"}
                </Text>
                {activeActor?.isVerified && (
                  <Ionicons name="checkmark-circle" size={15} color={PRIMARY} style={styles.verifiedIcon} />
                )}
                {activeActor?.type === "official" && (
                  <View style={[styles.typeBadge, { backgroundColor: isDark ? "rgba(255, 103, 25, 0.2)" : "#fff7ed", borderColor: PRIMARY }]}>
                    <Text style={[styles.typeBadgeText, { color: PRIMARY }]}>OFFICIAL</Text>
                  </View>
                )}
                {activeActor?.type === "team" && (
                  <View style={[styles.typeBadge, { backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "#eff6ff", borderColor: "#3b82f6" }]}>
                    <Text style={[styles.typeBadgeText, { color: "#3b82f6" }]}>TEAM</Text>
                  </View>
                )}
              </View>

              <View style={styles.pillRow}>
                {/* Switch Actor Pill (Matching capsule styling) */}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                    setActorPickerVisible(true);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Switch author identity"
                  android_ripple={{
                    color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                    borderless: false,
                  }}
                  style={({ pressed }) => [
                    styles.capsulePill,
                    {
                      borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "#e2e8f0",
                      backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                      opacity: pressed ? (Platform.OS === "ios" ? 0.75 : 0.95) : 1,
                    },
                  ]}
                >
                  <Ionicons name="person-circle-outline" size={13} color={mutedColor} />
                  <Text style={[styles.capsulePillText, { color: mutedColor }]} numberOfLines={1}>
                    Post as: {activeActor.id !== "me" ? activeActor.displayName : "Me"}
                  </Text>
                  <Ionicons name="chevron-down" size={11} color={mutedColor} />
                </Pressable>

                {/* Audience Pill (Disabled, Static capsule) */}
                <View
                  accessibilityRole="text"
                  accessibilityLabel="Audience: Everyone"
                  style={[
                    styles.capsulePill,
                    {
                      borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "#e2e8f0",
                      backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
                    },
                  ]}
                >
                  <Ionicons name="globe-outline" size={12} color={mutedColor} />
                  <Text style={[styles.capsulePillText, { color: mutedColor }]}>
                    {currentAudienceObj.label}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Direct TextInput with native focus handling */}
          <TextInput
            ref={inputRef}
            value={content}
            onChangeText={setContent}
            placeholder="What's happening in fellowship?"
            placeholderTextColor={isDark ? "#71717a" : "#94a3b8"}
            multiline
            autoFocus
            scrollEnabled={false}
            style={[styles.textInput, { color: textColor }]}
          />

          {/* Attached Location Tag */}
          {hasLocation && (
            <View
              style={[
                styles.locationBadge,
                {
                  borderColor: isDark ? "#27272a" : "#fed7aa",
                  backgroundColor: isDark ? "#1c1917" : "#fff7ed",
                },
              ]}
            >
              <Ionicons name="location" size={14} color={PRIMARY} />
              <Text style={[styles.locationText, { color: PRIMARY }]}>
                4 Kilo Campus, AAU
              </Text>
              <Pressable onPress={() => setHasLocation(false)} hitSlop={6}>
                <Ionicons name="close-circle" size={16} color={PRIMARY} />
              </Pressable>
            </View>
          )}

          {/* Attached Image Preview */}
          {pickedImageUri && (
            <View style={styles.imagePreviewWrapper}>
              <ExpoImage
                source={{ uri: pickedImageUri }}
                style={styles.imagePreview}
                contentFit="cover"
              />
              <Pressable
                onPress={() => setPickedImageUri(null)}
                style={styles.removeImageBtn}
                hitSlop={6}
              >
                <Ionicons name="close" size={18} color="#ffffff" />
              </Pressable>
            </View>
          )}

          {/* Tappable Canvas spacer to focus TextInput when tapping below text */}
          <Pressable
            style={styles.canvasSpacer}
            onPress={() => inputRef.current?.focus()}
          />
        </ScrollView>

        {/* Reply Permission Hint Row */}
        <Pressable
          onPress={() => showComingSoonToast("Reply settings")}
          accessibilityRole="button"
          accessibilityLabel="Reply permissions, coming soon"
          android_ripple={{
            color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)",
            borderless: false,
          }}
          style={styles.replyHintRow}
        >
          <Ionicons name="globe-outline" size={15} color={mutedColor} />
          <Text style={[styles.replyHintText, { color: mutedColor }]}>
            Everyone can reply
          </Text>
        </Pressable>

        {/* Bottom Toolbar */}
        <View style={[styles.bottomToolbar, { borderTopColor: borderColor }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarIconsRow}
          >
            {/* 1. Gallery (Coming soon) */}
            <Pressable
              onPress={() => showComingSoonToast("Photo gallery")}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Attach photo from gallery, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="image-outline" size={22} color={mutedColor} />
            </Pressable>

            {/* 2. Camera (Coming soon) */}
            <Pressable
              onPress={() => showComingSoonToast("Camera")}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Take photo with camera, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="camera-outline" size={22} color={mutedColor} />
            </Pressable>

            {/* 3. Audio / Devotion Scripture (Muted / Coming soon) */}
            <Pressable
              onPress={() => showComingSoonToast("Audio devotion")}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Audio notes, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="stats-chart-outline" size={21} color={mutedColor} />
            </Pressable>

            {/* 4. GIF badge (Muted / Coming soon) */}
            <Pressable
              onPress={() => showComingSoonToast("GIF picker")}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Attach GIF, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: false,
                radius: 12,
              }}
              style={[
                styles.gifBadgeBtn,
                {
                  borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#cbd5e1",
                  backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9",
                },
              ]}
            >
              <Text style={[styles.gifBadgeText, { color: mutedColor }]}>GIF</Text>
            </Pressable>

            {/* 5. Poll / Questionnaire (Muted / Coming soon) */}
            <Pressable
              onPress={() => showComingSoonToast("Polls")}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Create poll, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="list-outline" size={22} color={mutedColor} />
            </Pressable>

            {/* 6. Location Pin (Muted / Coming soon) */}
            <Pressable
              onPress={() => showComingSoonToast("Location tag")}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Tag location, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons
                name="location-outline"
                size={22}
                color={mutedColor}
              />
            </Pressable>

            {/* 7. Bookmark / Tag (Muted / Coming soon) */}
            <Pressable
              onPress={() => showComingSoonToast("Topics & tags")}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Add bookmark tag, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="bookmark-outline" size={21} color={mutedColor} />
            </Pressable>

            {/* 8. Plus Chip button (Muted / Coming soon) */}
            <Pressable
              onPress={() => showComingSoonToast("More attachments")}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="More attachments, coming soon"
              android_ripple={{
                color: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)",
                borderless: true,
                radius: 18,
              }}
              style={styles.toolIconBtn}
            >
              <Ionicons name="add-circle-outline" size={22} color={mutedColor} />
            </Pressable>
          </ScrollView>

          {/* 9. Circular Character Counter */}
          <View style={styles.charCounterWrap}>
            <Text
              style={[
                styles.charCounter,
                {
                  color:
                    charsLeft < 0
                      ? "#ef4444"
                      : charsLeft < 20
                        ? "#f59e0b"
                        : mutedColor,
                },
              ]}
            >
              {charsLeft}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Native Actor Selection Bottom Sheet */}
      <AppBottomSheet
        visible={actorPickerVisible}
        onClose={() => setActorPickerVisible(false)}
        isDark={isDark}
        snapPoints={["half", "full"]}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: textColor }]}>Post as</Text>
          <Text style={[styles.sheetSubtitle, { color: mutedColor }]}>
            Select your personal voice, fellowship team, or official account
          </Text>
        </View>

        <ScrollView
          style={styles.actorList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.actorListContent}
        >
          {availableActors.map((actor) => {
            const isSelected =
              activeActor?.id === actor.id ||
              (!selectedActor && actor.id === "me");
            const isOfficial = actor.type === "official";
            const isTeam = actor.type === "team";

            return (
              <Pressable
                key={actor.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  setSelectedActor(actor);
                  setActorPickerVisible(false);
                }}
                android_ripple={{
                  color: isDark ? "rgba(255, 103, 25, 0.25)" : "rgba(255, 103, 25, 0.15)",
                  borderless: false,
                }}
                style={({ pressed }) => [
                  styles.actorOption,
                  {
                    borderColor: isSelected ? PRIMARY : borderColor,
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(255, 103, 25, 0.15)"
                        : "#fff7ed"
                      : isDark
                        ? "#1f1f23"
                        : "#f8fafc",
                    opacity: pressed ? (Platform.OS === "ios" ? 0.75 : 0.95) : 1,
                  },
                ]}
              >
                <ExpoImage
                  source={{ uri: actor.avatarUrl || userAvatar }}
                  style={styles.actorOptionAvatar}
                  contentFit="cover"
                />
                <View style={styles.actorOptionTextCol}>
                  <View style={styles.actorOptionNameRow}>
                    <Text
                      style={[
                        styles.actorOptionName,
                        { color: textColor, fontWeight: isSelected ? "700" : "600" },
                      ]}
                      numberOfLines={1}
                    >
                      {actor.displayName}
                    </Text>
                    {actor.isVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={PRIMARY}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                    {isOfficial && (
                      <View
                        style={[
                          styles.actorPillBadge,
                          {
                            backgroundColor: isDark
                              ? "rgba(255, 103, 25, 0.25)"
                              : "#ffedd5",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.actorPillBadgeText,
                            { color: PRIMARY },
                          ]}
                        >
                          OFFICIAL
                        </Text>
                      </View>
                    )}
                    {isTeam && (
                      <View
                        style={[
                          styles.actorPillBadge,
                          {
                            backgroundColor: isDark
                              ? "rgba(59, 130, 246, 0.25)"
                              : "#dbeafe",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.actorPillBadgeText,
                            { color: "#3b82f6" },
                          ]}
                        >
                          TEAM
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.actorOptionHandle, { color: mutedColor }]}>
                    @{actor.handle ? actor.handle.replace(/^@/, "") : "member"}
                  </Text>
                </View>

                {isSelected && (
                  <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </AppBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtn: {
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  contentWrap: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e2e8f0",
  },
  authorMetaCol: {
    marginLeft: 12,
    flex: 1,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
    gap: 4,
  },
  authorDisplayName: {
    fontSize: 15,
    fontWeight: "700",
    maxWidth: 200,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  capsulePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  capsulePillText: {
    fontSize: 12,
    fontWeight: "600",
  },
  textInput: {
    fontSize: 18,
    lineHeight: 26,
    minHeight: 180,
    textAlignVertical: "top",
    paddingTop: 12,
    paddingBottom: 8,
  },
  canvasSpacer: {
    flex: 1,
    minHeight: 120,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  imagePreviewWrapper: {
    position: "relative",
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    height: 200,
    width: "100%",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  removeImageBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.65)",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  replyHintRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  replyHintText: {
    fontSize: 13,
    fontWeight: "600",
  },
  bottomToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolbarIconsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  toolIconBtn: {
    padding: 6,
  },
  gifBadgeBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gifBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  charCounterWrap: {
    paddingHorizontal: 8,
  },
  charCounter: {
    fontSize: 13,
    fontWeight: "600",
  },
  sheetHeader: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actorList: {
    marginTop: 6,
  },
  actorListContent: {
    paddingBottom: 24,
  },
  actorOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    overflow: "hidden",
    gap: 12,
  },
  actorOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#cbd5e1",
  },
  actorOptionTextCol: {
    flex: 1,
  },
  actorOptionNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actorOptionName: {
    fontSize: 15,
  },
  actorPillBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  actorPillBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },
  actorOptionHandle: {
    fontSize: 13,
    marginTop: 2,
  },
});
