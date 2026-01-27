import React from "react";
import Navbar from "@/components/Navbar";

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-primary/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
          Fellowship Catalog
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-zinc-600">
          Explore our resources, teams, and programs. (Version 1.0.0 Stable
          Release)
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Bible Study Guide 2024",
              description:
                "A comprehensive guide for weekly bible study sessions focusing on the Book of Acts.",
              type: "Document",
            },
            {
              title: "Sunday Worship Playlist",
              description:
                "Collection of contemporary and traditional hymns for the Sunday service.",
              type: "Audio",
            },
            {
              title: "Prayer Points Daily",
              description:
                "Daily prayer focus areas for the student community and the nation.",
              type: "Guide",
            },
            {
              title: "Freshman Orientation Kit",
              description:
                "Essential information and welcoming resources for new campus students.",
              type: "Kit",
            },
            {
              title: "Leadership Manual",
              description:
                "Guidelines and best practices for fellowship leaders and team coordinators.",
              type: "Document",
            },
            {
              title: "Evangelism Tracts",
              description:
                "Digital versions of tracts for outreach and sharing the gospel.",
              type: "Resource",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 transition-all hover:border-primary/20 hover:bg-white hover:shadow-lg"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                {item.type}
              </div>
              <h3 className="mb-2 text-xl font-bold text-zinc-900">
                {item.title}
              </h3>
              <p className="text-zinc-600">{item.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
