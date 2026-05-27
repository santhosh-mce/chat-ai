"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Plus, Clock } from "lucide-react";

export default function Dashboard() {
  const { user } = useStore();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchChats();
  }, [user]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats", {
        headers: { Authorization: `Bearer ${user?.token}` },
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
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
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

  if (!user) return null;

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Welcome back, {user.name}</h1>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={createNewChat}
            className="h-40 rounded-3xl border-2 border-dashed border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5 flex flex-col items-center justify-center gap-3 transition-all group"
          >
            <div className="p-3 bg-white/5 group-hover:bg-blue-500/20 rounded-full transition-colors">
              <Plus className="text-gray-400 group-hover:text-blue-400" />
            </div>
            <span className="font-medium text-gray-400 group-hover:text-blue-400">Start New Chat</span>
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Clock size={20} className="text-gray-400" /> Recent Conversations
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chats.map((chat) => (
            <Link
              key={chat._id}
              href={`/chat/${chat._id}`}
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <MessageSquare className="text-blue-400 shrink-0" size={24} />
                <span className="text-xs text-gray-500 shrink-0">
                  {new Date(chat.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-medium truncate">{chat.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
