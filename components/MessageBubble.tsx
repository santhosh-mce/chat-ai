"use client";

import { useState } from "react";
import { UserCircle, Bot, Copy, RefreshCw, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { motion } from "framer-motion";
import "highlight.js/styles/github-dark.css";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  onRegenerate?: () => void;
  isLast?: boolean;
}

export default function MessageBubble({ role, content, onRegenerate, isLast }: MessageBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("Copy failed", error);
    }
  };

  const copyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("Code copy failed", error);
    }
  };

  const components = {
    code({ className, children, ...props }: any) {
      const inline = !className;
      const codeText = String(children).replace(/\n$/, "");

      if (inline) {
        return (
          <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.92em] text-amber-100" {...props}>
            {children}
          </code>
        );
      }

      const lang = (className || "").replace("language-", "") || "text";

      return (
        <div className="not-prose my-4 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
            <span className="uppercase tracking-[0.18em] text-blue-200">{lang}</span>
            <button
              type="button"
              onClick={() => copyCode(codeText)}
              className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-gray-200 transition hover:bg-white/10 hover:text-white"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="max-w-full overflow-x-auto p-4 text-sm leading-6 text-gray-100">
            <code className={className} {...props}>{children}</code>
          </pre>
        </div>
      );
    },
    table({ children }: any) {
      return (
        <div className="my-4 overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
          <table className="min-w-full border-collapse text-sm text-gray-100">{children}</table>
        </div>
      );
    },
    th({ children }: any) {
      return <th className="border-b border-white/10 bg-white/5 px-3 py-2 text-left font-semibold text-white">{children}</th>;
    },
    td({ children }: any) {
      return <td className="border-b border-white/10 px-3 py-2 align-top text-gray-200">{children}</td>;
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 sm:gap-4 w-full rounded-3xl border border-white/8 p-4 sm:p-5 md:p-6 ${isUser ? "" : "bg-white/5 shadow-xl shadow-black/20"}`}
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
        <article className="prose prose-invert max-w-none break-words overflow-x-auto text-base sm:text-[17px] md:text-lg leading-7 sm:leading-8 prose-headings:text-white prose-h1:text-2xl sm:prose-h1:text-3xl prose-h2:text-xl sm:prose-h2:text-2xl prose-h3:text-lg sm:prose-h3:text-xl prose-p:text-gray-100 prose-p:leading-7 sm:prose-p:leading-8 prose-strong:text-white prose-ul:text-gray-100 prose-ol:text-gray-100 prose-blockquote:border-l-blue-400/70 prose-blockquote:text-gray-200 prose-code:before:hidden prose-code:after:hidden prose-pre:bg-transparent prose-pre:p-0 prose-table:w-full">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={components}
          >
            {content}
          </ReactMarkdown>
        </article>

        {!isUser && (
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-gray-300 transition hover:bg-white/10 hover:text-white"
              title="Copy response"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="rounded-full border border-white/10 bg-white/5 p-1.5 text-gray-300 transition hover:bg-white/10 hover:text-white"
                title="Regenerate response"
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
