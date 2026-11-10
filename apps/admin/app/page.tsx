"use client";

import React, { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Users,
  BookOpen,
  Calendar,
  ShoppingBag,
  HeartHandshake,
  Bot,
  Layers,
  ChevronRight,
  Server,
  Lock,
  Smartphone,
  Globe,
} from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

const emptySubscribe = () => () => {};

export default function LandingPage() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const isAuth = isClient ? isAuthenticated() : false;

  const modules = [
    {
      title: "Member Directory & Fellowship Teams",
      category: "Discipleship & Community",
      description:
        "Comprehensive fellowship registry tracking discipleship pathways, academic batches, departmental teams, and leadership rosters with instant filtering.",
      icon: Users,
      badge: "Members & Teams",
      gradient: "from-blue-500/10 to-indigo-500/10",
      accent: "text-blue-600 bg-blue-50 border-blue-200/60",
    },
    {
      title: "Devotions & Writer Publishing",
      category: "Spiritual Nourishment",
      description:
        "Structured daily devotional pipeline featuring author assignments, Scripture referencing, editorial review cycles, and synchronized mobile push notifications.",
      icon: BookOpen,
      badge: "Editorial Pipeline",
      gradient: "from-amber-500/10 to-orange-500/10",
      accent: "text-amber-600 bg-amber-50 border-amber-200/60",
    },
    {
      title: "Events & Attendance Management",
      category: "Gatherings & Programs",
      description:
        "Manage Friday large-group fellowships, prayer summits, spiritual retreats, and guest minister programs with QR code check-ins and capacity monitoring.",
      icon: Calendar,
      badge: "Events & Agendas",
      gradient: "from-emerald-500/10 to-teal-500/10",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
    },
    {
      title: "Fellowship Store & Merch Orders",
      category: "Literature & Merchandise",
      description:
        "Catalog branded fellowship hoodies, t-shirts, songbooks, and study guides with live stock tracking, order fulfillment, and pickup station management.",
      icon: ShoppingBag,
      badge: "Storefront & Orders",
      gradient: "from-purple-500/10 to-pink-500/10",
      accent: "text-purple-600 bg-purple-50 border-purple-200/60",
    },
    {
      title: "Givings, Tithes & Financial Audit",
      category: "Stewardship & Treasury",
      description:
        "Multi-channel financial management reconciling Telebirr transactions, direct CBE bank transfers, fellowship tithes, and student benevolence funds.",
      icon: HeartHandshake,
      badge: "Financial Ledger",
      gradient: "from-rose-500/10 to-red-500/10",
      accent: "text-rose-600 bg-rose-50 border-rose-200/60",
    },
    {
      title: "RBAC & Telegram Bot Automation",
      category: "Security & Operations",
      description:
        "Strict role-based access control paired with automated Telegram bot broadcasts for announcements, prayer requests, and campus-wide notifications.",
      icon: Bot,
      badge: "Automation & Security",
      gradient: "from-cyan-500/10 to-blue-500/10",
      accent: "text-cyan-600 bg-cyan-50 border-cyan-200/60",
    },
  ];

  const ecosystemStack = [
    {
      icon: Smartphone,
      label: "Mobile App",
      sub: "Expo SDK 58 • React Native",
    },
    {
      icon: Server,
      label: "Backend API",
      sub: "Node 24 • Express 5 • Prisma",
    },
    {
      icon: Bot,
      label: "Telegram Bot",
      sub: "Grammy.js • Real-time Broadcast",
    },
    {
      icon: Globe,
      label: "Web Portal",
      sub: "Next.js 16 • Tailwind CSS v4",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 selection:bg-[#ff6719]/20 selection:text-[#ff6719] relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#ff6719]/12 via-[#ff6719]/5 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-[180px] right-[10%] w-[380px] h-[380px] bg-amber-400/8 rounded-full blur-3xl" />
        <div className="absolute top-[200px] left-[10%] w-[340px] h-[340px] bg-orange-500/8 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none -z-10 opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #111827 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 border-b border-gray-200/70 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Identity */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200/80 p-1.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="4 Kilo Fellowship Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-950 text-base tracking-tight group-hover:text-[#ff6719] transition-colors">
                  4 Kilo Fellowship
                </span>
                <span className="inline-block text-[10px] font-semibold text-[#ff6719] bg-[#ff6719]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <span className="text-xs text-gray-500">
                AAU ECSF Leadership Console
              </span>
            </div>
          </Link>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            {/* Health Indicator Pill */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50/80 border border-emerald-200/60 text-xs font-medium text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>REST API Connected</span>
            </div>

            {/* Direct Console Entry */}
            <Link
              href={mounted && isAuth ? "/dashboard" : "/signin"}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#ff6719] hover:bg-[#e55a15] transition-all shadow-sm hover:shadow-md hover:shadow-orange-500/20 active:scale-[0.98]"
            >
              <span>{mounted && isAuth ? "Dashboard" : "Sign In"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 sm:pt-20 sm:pb-32">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-gray-200/80 text-gray-700 text-xs sm:text-sm font-medium shadow-xs mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-[#ff6719]" />
            <span className="font-semibold text-gray-900">AAU ECSF Ecosystem</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">Admin Portal</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-950 tracking-tight leading-[1.15]"
          >
            Empowering Fellowship Leadership with{" "}
            <span className="bg-gradient-to-r from-[#ff6719] via-[#ff7e39] to-amber-500 bg-clip-text text-transparent">
              Precision &amp; Grace
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-3xl"
          >
            The centralized administrative command center for{" "}
            <span className="font-medium text-gray-900">
              4 Kilo Christian Students Fellowship
            </span>{" "}
            — orchestrating member discipleship, devotions, events, giving, and
            community operations.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              href={mounted && isAuth ? "/dashboard" : "/signin"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white bg-[#ff6719] hover:bg-[#e55a15] transition-all shadow-md hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.98] text-base"
            >
              <span>{mounted && isAuth ? "Enter Admin Console" : "Sign In to Admin"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200/90 hover:border-gray-300 transition-all shadow-xs text-base group"
            >
              <span>Explore Public Portal</span>
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </a>
          </motion.div>

          {/* Platform Health Status Pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-gray-200 shadow-xs text-xs text-gray-600"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-medium text-gray-800">
              All Systems Operational
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">REST API Connected</span>
          </motion.div>
        </div>

        {/* Modules Highlights Grid */}
        <div className="mt-24 sm:mt-28">
          <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
            <span className="text-xs font-semibold text-[#ff6719] uppercase tracking-wider mb-2">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Comprehensive Operations Suite
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500 max-w-2xl">
              Every tool crafted specifically to support our pastoral staff, team
              leaders, and committee members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {modules.map((module, index) => {
              const Icon = module.icon;
              return (
                <motion.div
                  key={module.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="group relative flex flex-col justify-between p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs hover:shadow-xl hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    {/* Top row with icon & category badge */}
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border ${module.accent} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100/80 px-2.5 py-1 rounded-full">
                        {module.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#ff6719] transition-colors leading-snug">
                      {module.title}
                    </h3>

                    <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* Card Footer Link */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-500 group-hover:text-[#ff6719] transition-colors">
                    <span>{module.category}</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Ecosystem Architecture Strip */}
        <div className="mt-24 sm:mt-28 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-900 to-zinc-950 text-white relative overflow-hidden shadow-xl border border-gray-800">
          <div className="absolute right-0 bottom-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-[#ff6719]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff6719] mb-3">
                <Layers className="w-3.5 h-3.5" />
                Integrated Platform
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Unified 4 Kilo Fellowship Ecosystem
              </h3>
              <p className="mt-3 text-sm sm:text-base text-gray-400 leading-relaxed">
                Seamlessly uniting the mobile member app, automated Telegram
                service bot, REST API servers, and administrative dashboards into
                one synchronized infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
              {ecosystemStack.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex flex-col gap-1.5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <ItemIcon className="w-4 h-4 text-[#ff6719]" />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">{item.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security & Access Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6 text-[#ff6719]" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">
                Restricted Fellowship Leadership Access
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Protected by JSON Web Tokens, timing-safe cryptographic checks, and
                strict administrative privilege verification.
              </p>
            </div>
          </div>

          <Link
            href="/signin"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <span>Authorized Sign In</span>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="4 Kilo Fellowship"
              width={28}
              height={28}
              className="object-contain"
            />
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-gray-900">
                4 Kilo Christian Students Fellowship (AAU ECSF)
              </span>
              <span className="text-xs text-gray-500">
                Addis Ababa University Evangelical Christian Students Fellowship
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 text-xs text-gray-500">
            <span>
              &copy; {new Date().getFullYear()} AAU ECSF. All rights reserved.
            </span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span className="font-mono text-gray-400">Admin Console v2.4.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
