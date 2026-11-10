"use client";

import React from "react";
import { LeaderForm } from "@/components/LeaderForm";

export default function NewLeaderPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Leader</h1>
      </div>
      <LeaderForm />
    </div>
  );
}
