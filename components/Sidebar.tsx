"use client";

import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Settings, Image as ImageIcon, History } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { isSidebarOpen, user } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);

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
              <div className="space-y-1">
                {chats.map((chat) => (
                  <Link
                    key={chat._id}
                    href={`/chat/${chat._id}`}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors truncate ${pathname === `/chat/${chat._id}` ? 'bg-white/15 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <MessageSquare size={18} className="shrink-0" />
                    <span className="truncate text-sm">{chat.title}</span>
                  </Link>
                ))}
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
