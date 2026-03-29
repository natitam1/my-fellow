"use client";

import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Loader2, Sparkles, Upload, X, Settings2 } from "lucide-react";
import api from "@/lib/api";

interface AIPosterGeneratorProps {
  onPosterGenerated: (file: File, previewUrl: string) => void;
  defaultEventDetails?: {
    title?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  };
}

export function AIPosterGenerator({
  onPosterGenerated,
  defaultEventDetails,
}: AIPosterGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("Modern");
  const [colors, setColors] = useState({ primary: "", secondary: "" });
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const STYLES = [
    "Modern",
    "Minimal",
    "Cinematic",
    "Corporate",
    "Social Media Poster",
    "Vintage",
    "Abstract",
    "Neon/Cyberpunk",
  ];

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReferenceFile(file);
      setReferencePreview(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt for generation");
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);

      if (style) formData.append("style", style);
      if (colors.primary || colors.secondary) {
        formData.append("colors", JSON.stringify(colors));
      }
      if (defaultEventDetails) {
        formData.append("eventDetails", JSON.stringify(defaultEventDetails));
      }
      if (referenceFile) {
        formData.append("image", referenceFile);
      }

      const res = await api.post("/events/generate-poster", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.imageUrl) {
        setGeneratedImage(res.data.imageUrl);
        toast.success("Poster generated successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate poster");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePoster = async () => {
    if (!generatedImage) return;

    try {
      setLoading(true);
      const res = await fetch(generatedImage);
      const blob = await res.blob();
      const file = new File([blob], `ai-poster-${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
      });
      onPosterGenerated(file, generatedImage);
      setIsOpen(false);
      toast.success("AI Poster applied to event!");
    } catch (err) {
      toast.error("Failed to process the generated poster.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 border border-[#ff6719] text-[#ff6719] hover:bg-[#ff6719] hover:text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6719]"
      >
        <Sparkles className="w-4 h-4" />
        Generate with AI
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => !loading && setIsOpen(false)}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center gap-2">
                    <Sparkles className="text-[#ff6719] w-5 h-5" />
                    AI Poster Generator
                  </h3>
                  <button
                    onClick={() => !loading && setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                    disabled={loading}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Image Prompt
                      </label>
                      <textarea
                        rows={3}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. A vibrant youths worship night with neon lights and a modern aesthetic..."
                        className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-[#ff6719] focus:border-[#ff6719] border-gray-300 rounded-md py-2 px-3 border"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Style
                        </label>
                        <select
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#ff6719] focus:border-[#ff6719] sm:text-sm rounded-md border"
                        >
                          {STYLES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Primary Color
                          </label>
                          <input
                            type="color"
                            value={colors.primary || "#ff6719"}
                            onChange={(e) =>
                              setColors({ ...colors, primary: e.target.value })
                            }
                            className="mt-1 block w-full h-9 rounded-md border-gray-300 cursor-pointer p-1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Secondary Color
                          </label>
                          <input
                            type="color"
                            value={colors.secondary || "#000000"}
                            onChange={(e) =>
                              setColors({
                                ...colors,
                                secondary: e.target.value,
                              })
                            }
                            className="mt-1 block w-full h-9 rounded-md border-gray-300 cursor-pointer p-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Reference Image (Optional)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 transition">
                        {referencePreview ? (
                          <div className="space-y-1 text-center font-medium">
                            <p className="text-sm text-green-600 mb-2 border p-1 rounded">
                              Image uploaded
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setReferencePreview(null);
                                setReferenceFile(null);
                              }}
                              className="text-sm text-red-500 hover:text-red-700"
                            >
                              Remove reference
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="flex text-sm text-gray-600 justify-center">
                              <label
                                htmlFor="reference-upload"
                                className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#ff6719] hover:text-[#e55a15]"
                              >
                                <span>Upload a reference</span>
                                <input
                                  id="reference-upload"
                                  name="reference-upload"
                                  type="file"
                                  className="sr-only"
                                  accept="image/*"
                                  onChange={handleReferenceChange}
                                />
                              </label>
                            </div>
                            <p className="text-xs text-gray-500">
                              Provide visual guidance for layout
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleGenerate}
                      disabled={loading || !prompt}
                      className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#ff6719] hover:bg-[#e55a15] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6719] disabled:opacity-50 transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                          Generating... (this may take up to 20s)
                        </>
                      ) : (
                        "Generate Poster"
                      )}
                    </button>
                  </div>

                  <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-5 md:pt-0 md:pl-6 flex flex-col items-center justify-center bg-gray-50 rounded-lg min-h-[400px]">
                    {generatedImage ? (
                      <div className="w-full space-y-4">
                        <div className="relative w-full aspect-[4/5] rounded-md overflow-hidden shadow-md">
                          <Image
                            src={generatedImage}
                            alt="Generated Poster"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <button
                          onClick={handleUsePoster}
                          disabled={loading}
                          className="w-full flex justify-center py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                          {loading ? (
                            <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                          ) : (
                            "Use this Poster"
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 p-6">
                        <Settings2 className="w-16 h-16 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">
                          Set your prompt and hit generate to see the AI magic
                          happen here.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
