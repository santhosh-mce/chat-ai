"use client";

import { useEffect, useState } from "react";
import ImageCard from "@/components/ImageCard";
import { Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<{ _id?: string; url: string; prompt: string; publicId?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/images");
        if (!response.ok) return;
        const data = await response.json();
        setImages(data.map((item: any) => ({ _id: item._id, url: item.imageUrl, prompt: item.prompt, publicId: item.publicId })));
      } catch (error) {
        console.error("Failed to load image history", error);
      }
    };

    fetchHistory();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Call our backend API route (which enhances prompt with OpenRouter, then generates image)
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error: ${response.status}`);
      }

      const url = data.url;

      // Pre-load the image with better timeout handling
      await new Promise((resolve, reject) => {
        const img = new window.Image();
        // Data URLs don't need crossOrigin
        if (!url.startsWith("data:")) {
          img.crossOrigin = "anonymous";
        }
        
        const timeout = setTimeout(() => {
          reject(new Error("Image load timeout - took too long"));
        }, 15000); // 15 second timeout for loading
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };
        
        img.onerror = (error) => {
          clearTimeout(timeout);
          console.error("Image load error:", error);
          reject(new Error("Failed to load generated image"));
        };
        
        img.src = url;
      });

      setImages(prev => [{ _id: data.imageId, url, prompt: prompt.trim(), publicId: data.publicId }, ...prev]);
      setPrompt("");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image";
      console.error("Image generation error:", errorMessage);
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#09090b] to-[#09090b]">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6 border border-white/10">
            <ImageIcon className="text-blue-400" size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Image Generator</h1>
          <p className="text-gray-400 text-base sm:text-lg">Turn your imagination into stunning visuals instantly.</p>
        </div>

        <form onSubmit={handleGenerate} className="w-full max-w-3xl mx-auto mb-16">
          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full p-1.5 sm:p-2 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all shadow-2xl shadow-blue-500/5">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 outline-none px-4 sm:px-6 py-2.5 sm:py-3"
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full text-sm sm:text-base font-medium transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : "Generate"}
            </button>
          </div>
        </form>

        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <ImageCard
                key={img._id || img.url}
                url={img.url}
                prompt={img.prompt}
                onDelete={async () => {
                  if (!img._id) return;
                  try {
                    const response = await fetch("/api/images", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: img._id, publicId: img.publicId }),
                    });
                    if (!response.ok) throw new Error("Delete failed");
                    setImages((prev) => prev.filter((item) => (item._id || item.url) !== (img._id || img.url)));
                  } catch (error) {
                    console.error("Delete image failed", error);
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-50">
            <ImageIcon size={64} className="mb-4" />
            <p>Your generated images will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
