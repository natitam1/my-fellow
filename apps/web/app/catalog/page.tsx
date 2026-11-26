import React from "react";

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Fellowship Catalog
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
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
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                {item.type}
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
