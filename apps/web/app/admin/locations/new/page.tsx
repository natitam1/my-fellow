"use client";

import React from "react";
import { LocationForm } from "@/components/LocationForm";

export default function NewLocationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Add New Location</h1>
      </div>
      <LocationForm />
    </div>
  );
}
