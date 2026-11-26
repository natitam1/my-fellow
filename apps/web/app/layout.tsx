import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Toaster } from "sonner";

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins_400Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Poppins_500Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Poppins_600SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Poppins_700Bold.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  themeColor: "#FF6719",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "4 Kilo Fellowship | AAU ECSF",
  description:
    "The official digital platform of the 4 Kilo Christian Students Fellowship (AAU ECSF). Devotionals, student community, programs, giving, and leadership.",
  icons: {
    icon: "/images/logo-primary.png",
    apple: "/images/logo-primary.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans min-h-screen bg-background text-foreground antialiased flex flex-col selection:bg-primary/20 selection:text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Skip to content
            </a>
            <Navbar />
            <div
              id="main-content"
              tabIndex={-1}
              className="flex-1 flex flex-col focus:outline-none"
            >
              <AppShell>{children}</AppShell>
            </div>
            <Footer />
            <MobileTabBar />
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
