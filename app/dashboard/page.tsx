"use client";

import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Plus, Clock, Sparkles, Image as ImageIcon, Settings } from "lucide-react";

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
    <div className="h-full overflow-y-auto p-4 sm:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(17,24,39,0.95),rgba(30,41,59,0.85),rgba(17,24,39,0.95))] p-6 shadow-2xl shadow-blue-950/20 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/30 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">
                <Sparkles size={14} />
                AI workspace
              </p>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">Welcome back, {user.name}</h1>
                <p className="max-w-2xl text-sm text-slate-300 md:text-base">
                  Pick up your latest conversation, start a fresh chat, or jump into image generation from one polished workspace.
                </p>
              </div>
            </div>

            <button
              onClick={createNewChat}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:scale-[1.02] hover:shadow-blue-400/30 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
            >
              <Plus size={18} />
              Start new chat
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: "New chat", text: "Create a fresh conversation in seconds.", icon: MessageSquare, color: "from-blue-500/20 to-cyan-400/10" },
            { title: "Image generation", text: "Turn ideas into visuals with one click.", icon: ImageIcon, color: "from-purple-500/20 to-pink-400/10" },
            { title: "Preferences", text: "Tune your model and app settings quickly.", icon: Settings, color: "from-emerald-500/20 to-teal-400/10" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/8"
              >
                <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${item.color} p-3 text-blue-100`}>
                  <Icon size={18} />
                </div>
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-300">{item.text}</p>
              </article>
            );
          })}
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/20 p-6 shadow-xl shadow-black/20 backdrop-blur-xl md:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Recent conversations</h2>
              <p className="text-sm text-slate-300">Continue where you left off.</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">{chats.length} items</span>
          </div>

          {chats.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-300">
              No recent conversations yet. Start a new chat to build your first AI session.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {chats.map((chat) => (
                <Link
                  key={chat._id}
                  href={`/chat/${chat._id}`}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/8"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="rounded-2xl bg-blue-400/10 p-2 text-blue-200">
                      <MessageSquare size={18} />
                    </div>
                    <span className="text-xs text-slate-400">{new Date(chat.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white transition group-hover:text-blue-100">{chat.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">Open this thread and keep the conversation going.</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
