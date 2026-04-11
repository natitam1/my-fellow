"use client";

import React from "react";
import { TeamForm } from "@/components/TeamForm";

export default function NewTeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Team</h1>
      </div>
      <TeamForm />
    </div>
  );
}
