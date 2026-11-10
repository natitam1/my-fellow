"use client";

import React from "react";
import { DevotionForm } from "@/components/devotions/DevotionForm";

export default function NewDevotionPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Devotion</h1>
      </div>
      <DevotionForm />
    </div>
  );
}
