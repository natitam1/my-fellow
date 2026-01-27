"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Heart,
  BookOpen,
  MapPin,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    title: "Centralized Fellowship Information",
    icon: <Users className="h-6 w-6 text-primary" />,
    color: "bg-primary/10",
    description:
      "Access comprehensive details about the fellowship structure and teams.",
    points: [
      "Access team names, leaders, and contact numbers",
      "View meeting times and locations",
      "Interactive map links for easy navigation",
      "Fellowship overview and organizational structure",
    ],
  },
  {
    title: "Events & Registration",
    icon: <Calendar className="h-6 w-6 text-primary" />,
    color: "bg-primary/10",
    description:
      "Stay connected and never miss an important fellowship gathering.",
    points: [
      "Browse upcoming events in one place",
      "Detailed event pages with date, time, location",
      "Register seamlessly through integrated forms",
      "Automated reminders for important events",
    ],
  },
  {
    title: "Giving & Gifts",
    icon: <Heart className="h-6 w-6 text-primary" />,
    color: "bg-primary/10",
    description:
      "Integrated Chapa payment system for secure and easy financial support.",
    points: [
      "Contribute via multiple banks and mobile wallets",
      "Send one-time or recurring gifts",
      "Automated weekly or monthly reminders",
      "Secure and transparent donation tracking",
    ],
  },
  {
    title: "Daily Devotionals",
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    color: "bg-primary/10",
    description: "Nurture your spiritual growth with consistent daily content.",
    points: [
      "Text-based daily devotionals",
      "Date-based devotional feed (today/previous)",
      "Encouragement and biblical reflection anytime",
      "Admin upload for fresh content daily",
    ],
  },
];

const Features = () => {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Everything You Need, All in One App
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            My Fellow is designed to bridge the gap between you and the
            fellowship, providing essential tools for connection, growth, and
            support.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:gap-y-20">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm transition-all hover:bg-white hover:shadow-xl hover:border-primary/20"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-md ${feature.color}`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-zinc-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="mb-8 text-base leading-7 text-zinc-600">
                  {feature.description}
                </p>
                <ul role="list" className="mt-auto space-y-4">
                  {feature.points.map((point) => (
                    <li key={point} className="flex gap-x-3 text-zinc-700">
                      <CheckCircle2
                        className="h-6 w-5 flex-none text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
