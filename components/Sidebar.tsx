"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Settings, Image as ImageIcon, History, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { isSidebarOpen, user } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);

  const realChats = chats.filter((chat) => {
    const title = String(chat?.title || "").trim();
    return title.length > 0 && title.toLowerCase() !== "new chat";
  });

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, pathname]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats", {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createNewChat = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data._id}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteChat = async (id: string) => {
    if (!user) return;

    const confirmed = window.confirm("Delete this conversation?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) return;

      setChats((prev) => prev.filter((chat) => chat._id !== id));

      if (pathname === `/chat/${id}`) {
        router.push("/chat/new");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-[calc(100vh-4rem)] bg-black/40 border-r border-white/10 flex flex-col backdrop-blur-xl overflow-hidden shrink-0"
        >
          <div className="flex-1 overflow-y-auto p-4 w-[280px] space-y-6">
            <button
              onClick={createNewChat}
              className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors text-white"
            >
              <Plus size={20} />
              <span className="font-medium">New Chat</span>
            </button>

            <div className="flex flex-col gap-2">
              <Link href="/image-generator" className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname === '/image-generator' ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <ImageIcon size={20} />
                <span>Image Generator</span>
              </Link>
              <Link href="/dashboard" className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${pathname === '/dashboard' ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <History size={20} />
                <span>Dashboard</span>
              </Link>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">Recent Chats</div>
              <div className="max-h-[40vh] overflow-y-auto pr-1 space-y-1.5">
                {realChats.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-400">No real conversations yet.</div>
                ) : (
                  realChats.map((chat) => {
                    const isActive = pathname === `/chat/${chat._id}`;
                    const title = String(chat.title || "Untitled");
                    const displayTitle = title.length > 30 ? `${title.slice(0, 30)}...` : title;

                    return (
                      <div
                        key={chat._id}
                        className={`group flex items-center justify-between gap-2 rounded-xl px-3 py-2 transition-all duration-200 ${
                          isActive
                            ? "bg-white/15 text-white shadow-lg shadow-blue-500/10"
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Link href={`/chat/${chat._id}`} className="flex min-w-0 flex-1 items-center gap-3 rounded-lg">
                          <MessageSquare size={16} className="shrink-0 text-blue-300" />
                          <span className="truncate text-sm font-medium">{displayTitle}</span>
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteChat(chat._id);
                          }}
                          className="rounded-full p-1.5 text-gray-400 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100 focus:opacity-100 focus:outline-none sm:opacity-100 sm:hover:bg-white/10"
                          aria-label="Delete conversation"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          
          <div className="p-4 w-[280px] border-t border-white/10 bg-black/10">
            <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
