"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ProductForm } from "@/components/store/ProductForm";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/marketplace/products/${id}`);
        setInitialData(response.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load product data");
        router.push("/store");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6719]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
      </div>
      <ProductForm initialData={initialData} />
    </div>
  );
}
