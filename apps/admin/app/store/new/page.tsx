"use client";

import React from "react";
import { ProductForm } from "@/components/store/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
      </div>
      <ProductForm />
    </div>
  );
}
