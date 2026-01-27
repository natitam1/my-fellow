"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { siteConfig } from "@/config/siteConfig";
import {
  FaGithub,
  FaHeart,
  FaShareAlt,
  FaRegComments,
  FaCode,
} from "react-icons/fa";
import { HiExternalLink } from "react-icons/hi";

export default function SupportPage() {
  const supportOptions = [
    {
      title: "Contribute Code",
      description:
        "We are an open-source project! Star our repository, report issues, or submit pull requests to help us improve.",
      icon: <FaGithub className="h-8 w-8 text-primary" />,
      action: "Visit GitHub",
      href: siteConfig.links.githubRepo,
      primary: false,
    },
    {
      title: "Financial Support",
      description:
        "Support the fellowship's mission and activities through financial giving. Every contribution helps us grow.",
      icon: <FaHeart className="h-8 w-8 text-primary" />,
      action: "Give Now",
      href: "#give", // Placeholder for actual giving link
      primary: true,
    },
    {
      title: "Share the App",
      description:
        "Help us reach more students by sharing the My Fellow app with your friends and batchmates.",
      icon: <FaShareAlt className="h-8 w-8 text-primary" />,
      action: "Share",
      href: "#share",
      primary: false,
    },
    {
      title: "Send Feedback",
      description:
        "Have an idea or spotted a bug? Let us know! Your feedback is crucial for building a better app.",
      icon: <FaRegComments className="h-8 w-8 text-primary" />,
      action: "Contact Us",
      href: siteConfig.links.githubRepo, // Updated from telegramBot since it was disabled
      primary: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-primary/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Support the Fellowship
          </h1>
          <p className="text-lg text-zinc-600">
            There are many ways you can contribute to the growth and mission of
            the AAU 4-Kilo Students Christian Fellowship.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {supportOptions.map((option, index) => (
            <div
              key={index}
              className="group relative flex flex-col rounded-3xl border border-zinc-200 bg-zinc-50 p-8 transition-all hover:bg-white hover:shadow-xl hover:border-primary/20"
            >
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-sm transition-transform group-hover:scale-110">
                {option.icon}
              </div>

              <h3 className="mb-3 text-2xl font-bold text-zinc-900">
                {option.title}
              </h3>

              <p className="mb-8 grow text-zinc-600 leading-relaxed">
                {option.description}
              </p>

              <a
                href={option.href}
                target={option.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  option.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition-all ${
                  option.primary
                    ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    : "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300"
                }`}
              >
                {option.action}
                {option.href.startsWith("http") && (
                  <HiExternalLink className="h-4 w-4" />
                )}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl bg-zinc-900 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <FaCode className="h-12 w-12 text-zinc-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">
              Are you a Developer?
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto mb-8">
              We are looking for talented developers, designers, and product
              managers to join our technical team. Help us build tools for the
              Kingdom.
            </p>
            <a
              href={siteConfig.links.githubRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary/80 transition-colors"
            >
              Check out our Tech Stack <HiExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
