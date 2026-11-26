import { ScreenHeader } from "@/components/ScreenHeader";
import { useTheme } from "@/context/ThemeContext";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  View,
  type ScrollViewInstance,
  type ViewInstance,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LegalScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const { doc, section } = useLocalSearchParams<{
    doc?: string;
    section?: string;
  }>();
  const targetSection = doc || section;
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const privacyRef = useRef<ViewInstance>(null);
  const termsRef = useRef<ViewInstance>(null);

  const [privacyY, setPrivacyY] = React.useState(0);
  const [termsY, setTermsY] = React.useState(0);

  useEffect(() => {
    if (targetSection === "privacy" && privacyY > 0) {
      scrollViewRef.current?.scrollTo({ y: privacyY, animated: true });
    } else if (targetSection === "terms" && termsY > 0) {
      scrollViewRef.current?.scrollTo({ y: termsY, animated: true });
    }
  }, [targetSection, privacyY, termsY]);

  const renderSectionHeader = (title: string) => (
    <Text
      className={`text-2xl font-bold mb-4 mt-8 ${isDark ? "text-white" : "text-black"}`}
    >
      {title}
    </Text>
  );

  const renderContentText = (children: React.ReactNode) => (
    <Text
      className={`text-base leading-6 mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}
    >
      {children}
    </Text>
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScreenHeader title="Legal Information" />

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          onLayout={(e) => setTermsY(e.nativeEvent.layout.y)}
          ref={termsRef}
        >
          {renderSectionHeader("Terms of Use")}
          {renderContentText(
            "Welcome to My Fellow, the digital platform for the 4 Kilo Christian Students Fellowship (AAU ECSF). By using our application, you agree to comply with and be bound by the following terms and conditions of use.",
          )}
          {renderContentText(
            "1. Acceptance of Terms: By accessing this app, you signify your agreement to these Terms of Use. If you do not agree, please do not use the app.",
          )}
          {renderContentText(
            "2. Community Conduct & Moderation: Members must communicate respectfully and refrain from harassment, hate speech, spam, or objectionable content. We maintain zero tolerance for abusive behavior. Users can report objectionable posts or block abusive accounts directly from the community feed, and fellowship leaders review moderation reports within 24 hours.",
          )}
          {renderContentText(
            "3. Use License: Permission is granted to temporarily download one copy of the materials on My Fellow's app for personal, non-commercial transitory viewing only.",
          )}
          {renderContentText(
            "4. Disclaimer: The materials on My Fellow's app are provided on an 'as is' basis. My Fellow makes no warranties, expressed or implied.",
          )}
          {renderContentText(
            "5. Limitations: In no event shall My Fellow or its suppliers be liable for any damages arising out of the use or inability to use the materials.",
          )}
        </View>

        <View
          className="mt-12 pt-12 border-t border-zinc-100 dark:border-zinc-800"
          onLayout={(e) => setPrivacyY(e.nativeEvent.layout.y)}
          ref={privacyRef}
        >
          {renderSectionHeader("Privacy Policy")}
          {renderContentText(
            "Your privacy is important to us. It is My Fellow's policy to respect your privacy regarding any information we collect from you through the 4 Kilo Christian Students Fellowship mobile application.",
          )}
          {renderContentText(
            "1. Phone Number Authentication (GeezSMS): To verify your identity and sign you in without passwords, we collect your Ethiopian mobile phone number (+251 format) and transmit one-time verification codes (OTP) via GeezSMS. Your phone number is used strictly for account authentication, security, and fellowship profile management.",
          )}
          {renderContentText(
            "2. Profile & Media Uploads (Cloudinary): Optional profile information (full name, bio, academic department, year of study, ministry team, and Telegram username) as well as profile photos, community post images, and support attachments you choose to upload are stored securely using Cloudinary media storage and our fellowship servers.",
          )}
          {renderContentText(
            "3. Push Notifications: With your permission, we collect a device push token to deliver fellowship announcements, event updates, and devotion alerts. You can revoke notification permissions at any time in your device system settings.",
          )}
          {renderContentText(
            "4. Data Sharing & Security: We do not sell your personal data or share personally identifying information with third-party advertisers. Data is only processed by essential infrastructure providers (such as GeezSMS for SMS OTP delivery and Cloudinary for media hosting) or when required by law.",
          )}
          {renderContentText(
            "5. In-App Account Deletion & Data Rights: You have full control over your account. You may permanently delete your account and associated personal data at any time directly inside the app via Settings -> Account Actions -> Delete Account.",
          )}
        </View>
      </ScrollView>
    </View>
  );
}
