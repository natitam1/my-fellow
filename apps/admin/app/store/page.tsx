"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { Plus, Edit, Trash2, Loader2, Link as LinkIcon } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Product {
  id: string; // The API is returning Prisma generated ID which might be string format (uuid)
  title: string;
  shortDescription: string;
  price: string;
  imageUrls: string[];
  category: string;
  stock: number;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/marketplace/products");
      const raw = response.data;
      const productsData = raw?.data?.products || raw?.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/marketplace/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Store / Marketplace
        </h1>
        <Link
          href="/store/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a15] transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Product
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#ff6719]" />
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {products.map((product) => (
              <li key={product.id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="shrink-0 h-16 w-16 relative mr-4 bg-gray-100 rounded-md overflow-hidden">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <Image
                        src={product.imageUrls[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full text-gray-400">
                        <LinkIcon size={24} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="truncate">
                      <div className="flex text-sm">
                        <p className="font-medium text-[#ff6719] truncate text-lg">
                          {product.title}
                        </p>
                        <span className="ml-2 flex flex-row items-center font-normal px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-xs shadow-sm border border-blue-200 capitalize">
                          {product.category || "other"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 truncate">
                        {product.shortDescription}
                      </p>
                      <div className="mt-2 flex">
                        <div className="flex items-center text-sm font-semibold text-gray-900 mr-4">
                          Price: ${product.price}
                        </div>
                        <div
                          className={`flex items-center text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
                        >
                          Stock: {product.stock}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-5 shrink-0 flex gap-2">
                    <Link
                      href={`/store/${product.id}/edit`}
                      className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {products.length === 0 && (
              <li className="px-4 py-8 text-center text-gray-500">
                No products found in the store. Create one!
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
