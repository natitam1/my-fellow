"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
        setInitialData(response.data?.data || response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load product data");
        router.push("/admin/store");
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
      <div className="flex flex-col items-center justify-center p-16 gap-3">
        <Loader2 className="animate-spin text-[#ff6719] h-8 w-8" />
        <p className="text-sm text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="text-center p-12 text-gray-500">
        Product not found
      </div>
    );
  }

  return <ProductForm initialData={initialData} />;
}
