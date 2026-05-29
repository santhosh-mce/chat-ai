"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ResponseSwitcherProps {
  message: any;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ResponseSwitcher({ message, setMessages }: ResponseSwitcherProps) {
  const total = message.versions?.length || 1;
  const current = Math.min(message.activeVersion ?? 0, total - 1);

  const prevVersion = () => {
    if (current === 0) return;

    setMessages((prev: any[]) =>
      prev.map((msg: any) =>
        msg.id === message.id
          ? { ...msg, activeVersion: current - 1 }
          : msg
      )
    );
  };

  const nextVersion = () => {
    if (current >= total - 1) return;

    setMessages((prev: any[]) =>
      prev.map((msg: any) =>
        msg.id === message.id
          ? { ...msg, activeVersion: current + 1 }
          : msg
      )
    );
  };

  if (total <= 1) return null;

  return (
    <div className="mt-3 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 p-1 text-xs text-gray-200 shadow-sm shadow-black/20">
      <button
        type="button"
        onClick={prevVersion}
        disabled={current === 0}
        className="rounded-full p-1.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous response"
      >
        <ChevronLeft size={14} />
      </button>

      <span className="px-2 text-[11px] uppercase tracking-[0.18em] text-gray-300">
        {current + 1} / {total}
      </span>

      <button
        type="button"
        onClick={nextVersion}
        disabled={current >= total - 1}
        className="rounded-full p-1.5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next response"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
