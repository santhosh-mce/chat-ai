"use client";

import { Send, StopCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  onStop?: () => void;
}

export default function ChatInput({ onSend, isLoading, onStop }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-3 py-2 sm:px-4 sm:py-3 bg-black/30 backdrop-blur-md border-t border-white/10 sticky bottom-0">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 relative">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-2 focus-within:ring-2 focus-within:ring-blue-500/40 transition-all shadow-sm shadow-black/20">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Gemini anything..."
            className="w-full h-12 sm:h-14 bg-transparent text-sm sm:text-base text-white placeholder:text-sm placeholder:text-gray-400 resize-none outline-none py-2 px-3 max-h-[180px] leading-5 sm:leading-6"
            rows={1}
          />
          
          <div className="flex shrink-0 mb-1 mr-1">
            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="w-10 h-10 flex items-center justify-center bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full transition-colors"
              >
                <StopCircle size={20} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 text-white rounded-full transition-colors"
              >
                <Send size={20} />
              </button>
            )}
          </div>
        </form>
        <div className="text-center mt-2 text-xs text-gray-500 px-2 leading-relaxed">
          Gemini Clone can make mistakes. Consider verifying important information.
        </div>
      </div>
    </div>
  );
}
