"use client";

import React from "react";
import { ProgramForm } from "@/components/ProgramForm";

export default function NewProgramPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Create New Program</h1>
      </div>
      <ProgramForm />
    </div>
  );
}
