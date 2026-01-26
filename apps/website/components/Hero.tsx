"use client";

import React from "react";
import { siteConfig } from "@/config/siteConfig";

const Hero = () => {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-16 text-center sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute top-1/4 left-1/4 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-[80px]" />

      <div className="max-w-4xl">
        {/* Badge (Optional but adds to modern look) */}
        <div className="mb-6 inline-flex animate-fade-in items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          Fellowship Redefined
        </div>

        {/* H1 Title */}
        <h1 className="mb-6 bg-gradient-to-b from-zinc-900 to-zinc-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:from-white dark:to-zinc-500 sm:text-6xl md:text-7xl">
          All your fellowship life — <br className="hidden sm:block" />
          <span className="text-primary italic">in one place</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl">
          {siteConfig.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <a
            href={siteConfig.links.appDownload}
            className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-primary px-8 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
          >
            Get the Mobile App
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>

          <a
            href={siteConfig.links.telegramBot}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-8 text-lg font-bold text-zinc-900 transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 sm:w-auto"
          >
            <svg
              className="h-5 w-5 fill-[#0088cc]"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
            Use Telegram Bot
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
