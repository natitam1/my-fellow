"use client";

import React from "react";

const developers = [
  {
    name: "Natnael Tamiru",
    role: "Lead Developer",
    bio: "Computer Science Student at Addis Ababa University.",
    initials: "NT",
  },
];

const Developers = () => {
  return (
    <section className="bg-zinc-50 py-24 sm:py-32 border-t border-zinc-200">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Built by AAU CS Students
          </h2>
          <p className="mt-6 text-lg leading-8 text-zinc-600">
            Passionate developers from Addis Ababa University dedicating their
            skills to serve the fellowship.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl lg:max-w-4xl">
          <div className="flex flex-wrap justify-center gap-8">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-zinc-100 hover:shadow-md transition-shadow min-w-[240px]"
              >
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl mb-4">
                  {dev.initials}
                </div>
                <h3 className="text-xl font-bold text-zinc-900">{dev.name}</h3>
                <p className="text-primary font-medium text-sm mb-2">
                  {dev.role}
                </p>
                <p className="text-zinc-500 text-center text-sm">{dev.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Developers;
