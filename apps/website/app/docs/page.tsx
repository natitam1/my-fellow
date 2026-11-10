"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import {
  FaBook,
  FaUserPlus,
  FaMobileAlt,
  FaQuestionCircle,
} from "react-icons/fa";

export default function DocsPage() {
  const guides = [
    {
      title: "Getting Started",
      description:
        "Learn the basics of the My Fellow app and how to install it on your device.",
      icon: <FaMobileAlt className="h-6 w-6 text-primary" />,
      content: (
        <ul className="space-y-2 text-zinc-600">
          <li>• Downloading the app from the landing page</li>
          <li>• System requirements for Android and iOS</li>
          <li>• First-time setup and permissions</li>
        </ul>
      ),
    },
    {
      title: "Account & Profile",
      description: "Setting up your digital identity within the fellowship.",
      icon: <FaUserPlus className="h-6 w-6 text-primary" />,
      content: (
        <ul className="space-y-2 text-zinc-600">
          <li>• Registering with your phone number</li>
          <li>• Completing your profile (Year, Department, Team)</li>
          <li>• Managing privacy settings</li>
        </ul>
      ),
    },
    {
      title: "Using Features",
      description:
        "Deep dive into the core functionalities of the application.",
      icon: <FaBook className="h-6 w-6 text-primary" />,
      content: (
        <ul className="space-y-2 text-zinc-600">
          <li>• Browsing the Team Directory</li>
          <li>• Registering for Events</li>
          <li>• Using the Digital Hymnal</li>
          <li>• Reading Daily Devotionals</li>
        </ul>
      ),
    },
    {
      title: "Troubleshooting",
      description: "Common issues and how to resolve them quickly.",
      icon: <FaQuestionCircle className="h-6 w-6 text-primary" />,
      content: (
        <ul className="space-y-2 text-zinc-600">
          <li>• Login issues and OTP verification</li>
          <li>• Notification settings</li>
          <li>• Reporting bugs to the dev team</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-primary/30">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
            Documentation
          </h1>
          <p className="text-lg text-zinc-600">
            Everything you need to know about using the My Fellow app
            effectively.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {guides.map((guide, index) => (
            <div
              key={index}
              className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 transition-all hover:bg-white hover:shadow-xl hover:border-primary/20"
            >
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                {guide.icon}
              </div>
              <h2 className="mb-3 text-2xl font-bold text-zinc-900">
                {guide.title}
              </h2>
              <p className="mb-6 text-zinc-600">{guide.description}</p>
              <div className="rounded-xl bg-white border border-zinc-100 p-6">
                {guide.content}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
