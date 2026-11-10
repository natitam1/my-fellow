import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://4kilofellowship.org"),
  title: {
    default: "4 Kilo ECSF — AAU Christian Students Fellowship",
    template: "%s | 4 Kilo ECSF",
  },
  description:
    "Official digital ecosystem for the AAU 4-Kilo Evangelical Christian Students Fellowship (ECSF) — connecting students, devotions, fellowship events, and discipleship.",
  keywords: [
    "AAU",
    "ECSF",
    "4 Kilo",
    "Addis Ababa University",
    "Christian Students Fellowship",
    "My Fellow App",
    "Ethiopian Fellowship",
  ],
  openGraph: {
    title: "4 Kilo ECSF — Fellowship Ecosystem",
    description:
      "Stay spiritually nurtured and deeply connected with AAU 4-Kilo Christian Students Fellowship through the My Fellow app.",
    url: "https://4kilofellowship.org",
    siteName: "My Fellow — 4 Kilo ECSF",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "4 Kilo ECSF — Fellowship Ecosystem",
    description:
      "Stay spiritually nurtured and deeply connected with AAU 4-Kilo Christian Students Fellowship through the My Fellow app.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="flex-1">{children}</div>
        <Footer />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
