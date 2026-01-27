import React from "react";
import Navbar from "@/components/Navbar";

export default function ChangelogPage() {
  const changes = [
    {
      version: "v1.0.0",
      date: "January 27, 2026",
      title: "Initial Stable Release",
      description: "The first stable release of the My Fellow app and website.",
      features: [
        "User Authentication & Profiles",
        "Fellowship Catalog & Resources",
        "Team Directory & Information",
        "Live Announcements Feed",
        "Daily Devotionals",
      ],
    },
    {
      version: "v0.9.0",
      date: "January 15, 2026",
      title: "Beta Testing",
      description: "Beta release for selected group identifiers and leaders.",
      features: [
        "Basic Directory Structure",
        "Initial UI/UX Design",
        "Core Navigation",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-primary/30">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Changelog
          </h1>
          <p className="text-lg text-zinc-600">
            Stay updated with the latest changes, improvements, and releases.
          </p>
        </div>

        <div className="relative border-l border-zinc-200 pl-8 ml-4 space-y-12">
          {changes.map((release, index) => (
            <div key={index} className="relative">
              <span className="absolute -left-[41px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 ring-4 ring-white">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </span>

              <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                <h2 className="text-2xl font-bold text-zinc-900">
                  {release.version}
                </h2>
                <span className="w-fit rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
                  {release.date}
                </span>
              </div>

              <h3 className="mb-3 text-lg font-semibold text-primary">
                {release.title}
              </h3>
              <p className="mb-4 text-zinc-600 leading-relaxed">
                {release.description}
              </p>

              <ul className="list-disc space-y-2 pl-5 text-zinc-600">
                {release.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
