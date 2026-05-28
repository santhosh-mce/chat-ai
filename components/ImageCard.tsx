"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, AlertCircle, Trash2 } from "lucide-react";

interface ImageCardProps {
  url: string;
  prompt: string;
  onDelete?: () => Promise<void> | void;
}

export default function ImageCard({ url, prompt, onDelete }: ImageCardProps) {
  const [hasError, setHasError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `pollinations-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading image", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 aspect-square flex items-center justify-center"
      >
        <div className="text-center p-4">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400 line-clamp-3">{prompt}</p>
          <p className="text-xs text-red-400 mt-2">Failed to load image</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={prompt}
        crossOrigin="anonymous"
        className="w-full aspect-square object-cover"
        onError={() => setHasError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
        <p className="text-sm text-white line-clamp-2 mb-3">{prompt}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl w-fit backdrop-blur-md transition-colors text-sm disabled:opacity-50"
          >
            <Download size={16} />
            {isDownloading ? "Downloading..." : "Download"}
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-white px-4 py-2 rounded-xl w-fit backdrop-blur-md transition-colors text-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
