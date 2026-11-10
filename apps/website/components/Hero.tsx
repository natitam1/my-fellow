"use client";

import React from "react";
import { HiDownload } from "react-icons/hi";
import { siteConfig } from "@/config/siteConfig";
import { toast } from "sonner";

const Hero = () => {
  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.error("Application Under Maintenance", {
      description:
        "We are currently rolling out new improvements and security updates. Please check back later today!",
      duration: 5000,
    });
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-32 pb-32 text-center sm:px-6 lg:px-8">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute top-1/4 left-1/4 -z-10 h-32 w-32 rounded-full bg-primary/10 blur-[80px]" />

      <div className="max-w-4xl">
        {/* Badge (Optional but adds to modern look) */}
        <div className="mb-6 inline-flex animate-fade-in items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
          <span className="mr-2 flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          Your Fellowship, Unified
        </div>

        {/* H1 Title */}
        <h1 className="mb-6 bg-linear-to-b from-zinc-900 to-zinc-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl">
          All your fellowship life <br className="hidden sm:block" />
          <span className="text-primary italic">in one place</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-zinc-600 md:text-xl">
          {siteConfig.description}
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={siteConfig.links.appDownload}
            onClick={handleDownload}
            className="group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary px-8 text-lg font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
          >
            <div className="flex items-center gap-2">
              <span>Download App</span>
              <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-medium tracking-wider backdrop-blur-sm">
                {siteConfig.version}
              </span>
            </div>
            <HiDownload className="h-5 w-5 transition-transform duration-300 group-hover:translate-y-1" />
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
          <a
            href="#faqs"
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-8 text-lg font-bold text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300 active:scale-[0.98] sm:w-auto"
          >
            <span>Learn More</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
