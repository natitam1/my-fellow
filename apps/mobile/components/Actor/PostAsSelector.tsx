import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { AppBottomSheet } from "@/components/AppBottomSheet";
import { PRIMARY } from "@/constants";
import { useTheme } from "@/context/ThemeContext";
import { PostableActor } from "@/types/social.types";
import { getPrefilledAvatar } from "@/utils/avatar";

export interface PostAsSelectorProps {
  selectedActor: PostableActor | null;
  onSelectActor: (actor: PostableActor) => void;
  actors: PostableActor[];
  loading?: boolean;
}

export const PostAsSelector: React.FC<PostAsSelectorProps> = ({
  selectedActor,
  onSelectActor,
  actors,
  loading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [sheetVisible, setSheetVisible] = useState(false);

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const mutedColor = isDark ? "#94a3b8" : "#64748b";
  const borderColor = isDark ? "#27272a" : "#e2e8f0";
  const cardBg = isDark ? "#18181b" : "#f8fafc";
  const secondaryBorder = isDark ? "rgba(255, 255, 255, 0.08)" : "#e2e8f0";

  const formatHandle = (handle?: string | null): string => {
    if (!handle) return "@fellowship";
    const cleaned = handle.trim().replace(/^@+/, "");
    return `@${cleaned}`;
  };

  const getActorBadgeInfo = (type?: "official" | "team" | "user") => {
    switch (type) {
      case "official":
        return {
          label: "OFFICIAL",
          bg: isDark ? "rgba(255, 103, 25, 0.2)" : "#fff7ed",
          border: PRIMARY,
          text: PRIMARY,
        };
      case "team":
        return {
          label: "TEAM",
          bg: isDark ? "rgba(59, 130, 246, 0.2)" : "#eff6ff",
          border: "#3b82f6",
          text: "#3b82f6",
        };
      case "user":
      default:
        return {
          label: "WRITER",
          bg: isDark ? "rgba(148, 163, 184, 0.15)" : "#f1f5f9",
          border: isDark ? "#475569" : "#cbd5e1",
          text: isDark ? "#cbd5e1" : "#475569",
        };
    }
  };

  const renderRoleBadge = (type?: "official" | "team" | "user") => {
    const info = getActorBadgeInfo(type);
    return (
      <View
        style={[
          styles.badge,
          {
            backgroundColor: info.bg,
            borderColor: info.border,
          },
        ]}
      >
        <Text style={[styles.badgeText, { color: info.text }]}>{info.label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionLabel, { color: textColor }]}>
          Publishing As <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <View style={[styles.loadingBox, { backgroundColor: cardBg, borderColor }]}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={[styles.loadingText, { color: mutedColor }]}>
            Loading author identities...
          </Text>
        </View>
      </View>
    );
  }

  const avatarUri =
    selectedActor?.avatarUrl ||
    getPrefilledAvatar(selectedActor?.handle || selectedActor?.id || "fellowship");

  const canSwitch = actors.length > 1;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.sectionLabel, { color: textColor }]}>
          Publishing As <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        {selectedActor?.type === "official" && (
          <View style={styles.officialHeaderTag}>
            <Ionicons name="shield-checkmark" size={13} color={PRIMARY} />
            <Text style={[styles.officialHeaderText, { color: PRIMARY }]}>
              Verified Channel
            </Text>
          </View>
        )}
      </View>

      {/* Main Persona Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor,
          },
        ]}
      >
        {/* Avatar */}
        <ExpoImage
          source={{ uri: avatarUri }}
          style={styles.avatar}
          contentFit="cover"
          transition={200}
        />

        {/* Identity Meta */}
        <View style={styles.metaCol}>
          <View style={styles.nameRow}>
            <Text
              style={[styles.displayName, { color: textColor }]}
              numberOfLines={1}
            >
              {selectedActor?.displayName || "Fellowship Contributor"}
            </Text>
            {selectedActor?.isVerified && (
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={PRIMARY}
                style={styles.verifiedIcon}
              />
            )}
            {renderRoleBadge(selectedActor?.type)}
          </View>

          <Text style={[styles.handleText, { color: mutedColor }]} numberOfLines={1}>
            {formatHandle(selectedActor?.handle)}
          </Text>
        </View>

        {/* Switch Persona Pill (Only shown if actors.length > 1) */}
        {canSwitch && (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              setSheetVisible(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Switch author persona"
            android_ripple={{
              color: isDark ? "rgba(255, 103, 25, 0.25)" : "rgba(255, 103, 25, 0.16)",
              borderless: false,
            }}
            style={({ pressed }) => [
              styles.switchPill,
              {
                borderColor: isDark ? "rgba(255, 103, 25, 0.5)" : "#fed7aa",
                backgroundColor: isDark ? "rgba(255, 103, 25, 0.15)" : "#fff7ed",
                opacity: pressed ? (Platform.OS === "ios" ? 0.75 : 0.95) : 1,
              },
            ]}
          >
            <Ionicons name="swap-horizontal" size={13} color={PRIMARY} />
            <Text style={[styles.switchPillText, { color: PRIMARY }]}>Switch</Text>
            <Ionicons name="chevron-down" size={12} color={PRIMARY} />
          </Pressable>
        )}
      </View>

      {/* Switch Persona Bottom Sheet */}
      <AppBottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        isDark={isDark}
        snapPoints={["half", "full"]}
      >
        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: textColor }]}>
            Publish Devotion As
          </Text>
          <Text style={[styles.sheetSubtitle, { color: mutedColor }]}>
            Select your personal voice, fellowship team, or official channel
          </Text>
        </View>

        <ScrollView
          style={styles.sheetList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28 }}
        >
          {actors.map((actor) => {
            const isSelected = selectedActor?.id === actor.id;
            const actorAvatar =
              actor.avatarUrl ||
              getPrefilledAvatar(actor.handle || actor.id || "fellowship");

            return (
              <Pressable
                key={actor.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
                  onSelectActor(actor);
                  setSheetVisible(false);
                }}
                android_ripple={{
                  color: isDark ? "rgba(255, 103, 25, 0.25)" : "rgba(255, 103, 25, 0.15)",
                  borderless: false,
                }}
                style={({ pressed }) => [
                  styles.actorOption,
                  {
                    borderColor: isSelected ? PRIMARY : secondaryBorder,
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(255, 103, 25, 0.14)"
                        : "#fff7ed"
                      : isDark
                        ? "#27272a"
                        : "#f8fafc",
                    opacity: pressed ? (Platform.OS === "ios" ? 0.75 : 0.95) : 1,
                  },
                ]}
              >
                <ExpoImage
                  source={{ uri: actorAvatar }}
                  style={styles.sheetAvatar}
                  contentFit="cover"
                />

                <View style={styles.sheetActorInfo}>
                  <View style={styles.sheetActorNameRow}>
                    <Text
                      style={[
                        styles.sheetActorName,
                        { color: textColor, fontWeight: isSelected ? "700" : "600" },
                      ]}
                      numberOfLines={1}
                    >
                      {actor.displayName}
                    </Text>
                    {actor.isVerified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={15}
                        color={PRIMARY}
                        style={{ marginLeft: 3 }}
                      />
                    )}
                    {renderRoleBadge(actor.type)}
                  </View>

                  <Text style={[styles.sheetActorHandle, { color: mutedColor }]}>
                    {formatHandle(actor.handle)}
                  </Text>

                  {Boolean(actor.bio) && (
                    <Text
                      style={[styles.sheetActorBio, { color: mutedColor }]}
                      numberOfLines={2}
                    >
                      {actor.bio}
                    </Text>
                  )}
                </View>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={22} color={PRIMARY} />
                ) : (
                  <View
                    style={[
                      styles.unselectedRadio,
                      { borderColor: isDark ? "#52525b" : "#cbd5e1" },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </AppBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  requiredAsterisk: {
    color: "#ef4444",
  },
  officialHeaderTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  officialHeaderText: {
    fontSize: 12,
    fontWeight: "700",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#cbd5e1",
  },
  metaCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
    marginBottom: 2,
  },
  displayName: {
    fontSize: 15,
    fontWeight: "700",
    maxWidth: 160,
  },
  verifiedIcon: {
    marginLeft: 1,
  },
  handleText: {
    fontSize: 12.5,
    fontWeight: "500",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  switchPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    gap: 4,
    marginLeft: 8,
  },
  switchPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  sheetHeader: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150, 150, 150, 0.2)",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  sheetSubtitle: {
    fontSize: 12.5,
    marginTop: 3,
    lineHeight: 18,
  },
  sheetList: {
    marginTop: 4,
  },
  actorOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    gap: 12,
  },
  sheetAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#cbd5e1",
  },
  sheetActorInfo: {
    flex: 1,
  },
  sheetActorNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  sheetActorName: {
    fontSize: 15,
    maxWidth: 170,
  },
  sheetActorHandle: {
    fontSize: 12.5,
    marginTop: 2,
    fontWeight: "500",
  },
  sheetActorBio: {
    fontSize: 11.5,
    marginTop: 3,
    lineHeight: 15,
  },
  unselectedRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
});

export default PostAsSelector;
