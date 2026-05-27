"use client";

import { UserCircle, Bot, Copy, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export default function MessageBubble({ role, content, onRegenerate, isLast }: MessageBubbleProps) {
  const isUser = role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 p-4 md:p-6 w-full ${isUser ? "" : "bg-white/5"}`}
    >
      <div className="shrink-0 mt-1">
        {isUser ? (
          <UserCircle size={28} className="text-gray-400" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="prose prose-invert max-w-none prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        
        {!isUser && (
          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleCopy} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors" title="Copy Message">
              <Copy size={16} />
            </button>
            {isLast && onRegenerate && (
              <button onClick={onRegenerate} className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded transition-colors" title="Regenerate Response">
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
