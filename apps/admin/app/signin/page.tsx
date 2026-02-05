"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import api from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function SignIn() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/signin", formData);
      const raw = response.data;
      const data = raw.data || raw;
      const { token, user } = data;

      if (!token) throw new Error("Token missing from response");

      setToken(token);
      if (user) {
        setUser(user);
      }

      toast.success("Successfully signed in!");
      router.push("/");
    } catch (error: any) {
      // Use console.warn instead of console.error to avoid triggering Next.js error overlay
      console.warn("Login attempt failed:", error.message);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to sign in. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Image with Text Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        {/* Background Image */}
        <Image
          src="/images/dashboard.jpg"
          alt="Dashboard"
          fill
          className="object-cover"
          priority
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-16 left-12 right-12 z-10">
          <p className="text-white/80 text-sm font-medium tracking-widest uppercase mb-4">
            4Kilo Fellowship
          </p>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Manage your community
            <br />
            with confidence.
          </h1>
          <p className="text-white/70 text-base max-w-md">
            Access powerful tools for event management, user analytics, and
            community engagement.
          </p>
        </div>
      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={20}
                height={20}
                className="object-contain"
              />
            </div>
            <span className="text-gray-900 font-semibold">
              4Kilo Fellowship
            </span>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome back
            </h2>
            <p className="text-gray-500 text-sm">
              Enter your credentials to access the dashboard
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="0912345678"
                autoComplete="username"
                className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff6719] focus:ring-4 focus:ring-[#ff6719]/15 transition-all duration-200 hover:border-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#ff6719] focus:ring-4 focus:ring-[#ff6719]/15 transition-all duration-200 hover:border-gray-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 mt-2 bg-[#ff6719] hover:bg-[#e55a15] text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mx-auto" />
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-10 text-center text-xs text-gray-400">
            © 2026 4Kilo Fellowship. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
