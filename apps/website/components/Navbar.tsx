"use client";

import React, { useState, useEffect } from "react";
import { FaGithub } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/siteConfig";
import { getGitHubStars } from "@/lib/github";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stars, setStars] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchStars = async () => {
      const starCount = await getGitHubStars(
        siteConfig.github.owner,
        siteConfig.github.repo,
      );
      setStars(starCount);
    };
    fetchStars();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Changelog", href: siteConfig.links.changelog },
    { name: "Support", href: siteConfig.links.support },
    { name: "FAQs", href: siteConfig.links.faqs },
    { name: "Docs", href: siteConfig.links.docs },
  ];

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="shrink-0">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt={siteConfig.name}
              width={160}
              height={160}
            />
          </Link>
        </div>

        {/* Center: Desktop Menu */}
        <div className="hidden md:block">
          <div className="ml-10 flex items-baseline space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: GitHub & Contribute */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href={siteConfig.links.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 transition-all hover:bg-zinc-100"
          >
            <FaGithub className="h-4 w-4 fill-current" />
            <span>{stars !== null ? stars.toLocaleString() : "..."}</span>
          </a>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
              {siteConfig.version}
            </span>
            <a
              href={siteConfig.links.githubRepo}
              className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
            >
              Contribute
            </a>
          </div>
        </div>

        {/* Mobile: Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center rounded-md p-2 text-zinc-600 hover:bg-zinc-100 hover:text-primary"
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? (
              <HiX className="h-6 w-6" />
            ) : (
              <HiMenu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        } bg-white border-b border-zinc-200`}
      >
        <div className="space-y-1 px-2 pb-3 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block rounded-md px-3 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 hover:text-primary"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center justify-between px-3 py-4 border-t border-zinc-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500">
                {siteConfig.version}
              </span>
              <a
                href={siteConfig.links.githubRepo}
                className="text-sm font-semibold text-primary"
              >
                Contribute
              </a>
            </div>
            <a
              href={siteConfig.links.githubRepo}
              className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700"
            >
              <FaGithub className="h-4 w-4 fill-current" />
              <span>{stars !== null ? stars.toLocaleString() : "..."}</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
