"use client";

import { useStore } from "@/store/useStore";
import ModelSelector from "./ModelSelector";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Settings,
  Image as ImageIcon,
  History,
  Trash2,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { isSidebarOpen, user } = useStore();

  const pathname = usePathname();
  const router = useRouter();

  const [chats, setChats] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  const selectedModel = useStore((state) => state.selectedModel);
  const setSelectedModel = useStore(
    (state) => state.setSelectedModel
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user]);

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
        body: JSON.stringify({
          title: "New Chat",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/chat/${data._id}`);

        if (isMobile) {
          useStore.setState({
            isSidebarOpen: false,
          });
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteChat = async (id: string) => {
    if (!user) return;

    const confirmed = window.confirm(
      "Delete this conversation?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/chats/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!res.ok) return;

      setChats((prev) =>
        prev.filter((chat) => chat._id !== id)
      );

      if (pathname === `/chat/${id}`) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const realChats = chats.filter((chat) => {
    const title = String(chat?.title || "").trim();

    return (
      title.length > 0 &&
      title.toLowerCase() !== "new chat"
    );
  });

  const showSidebar = isMobile
    ? isSidebarOpen
    : true;

  return (
    <AnimatePresence>
      {showSidebar && (
        <>
          {/* Mobile Overlay */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                useStore.setState({
                  isSidebarOpen: false,
                })
              }
              className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm"
            />
          )}

          {/* Sidebar */}
          <motion.aside
            initial={isMobile ? { x: "-100%" } : undefined}
            animate={{ x: 0 }}
            exit={isMobile ? { x: "-100%" } : undefined}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="
              fixed
              left-0
              top-16
              z-40
              h-[calc(100vh-64px)]
              w-[280px]
              flex
              flex-col
              border-r
              border-white/10
              bg-[linear-gradient(180deg,rgba(6,7,10,0.98),rgba(9,11,18,0.96),rgba(15,23,42,0.96))]
              shadow-2xl
              shadow-black/50
              backdrop-blur-2xl
            "
          >
            {/* Top */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* New Chat */}
              <button
                onClick={createNewChat}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-blue-400/30
                  bg-gradient-to-r
                  from-blue-500
                  via-indigo-500
                  to-purple-500
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:scale-[1.02]
                "
              >
                <Plus size={18} />
                <span>New Chat</span>
              </button>

              {/* Links */}
              <div className="flex flex-col gap-2">
                <Link
                  href="/image-generator"
                  className={`flex items-center gap-3 rounded-xl p-3 transition ${
                    pathname === "/image-generator"
                      ? "bg-white/15 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <ImageIcon size={20} />
                  <span>Image Generator</span>
                </Link>

                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 rounded-xl p-3 transition ${
                    pathname === "/dashboard"
                      ? "bg-white/15 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <History size={20} />
                  <span>Dashboard</span>
                </Link>
              </div>

              {/* Chats */}
              <div>
                <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Recent Chats
                </div>

                <div className="space-y-2">
                  {realChats.length === 0 ? (
                    <div className="rounded-xl bg-white/5 p-3 text-sm text-gray-400">
                      No chats yet
                    </div>
                  ) : (
                    realChats.map((chat) => {
                      const isActive =
                        pathname === `/chat/${chat._id}`;

                      return (
                        <div
                          key={chat._id}
                          className={`
                            group
                            flex
                            items-center
                            justify-between
                            gap-2
                            rounded-xl
                            px-3
                            py-2
                            transition
                            ${
                              isActive
                                ? "bg-white/15 text-white"
                                : "text-gray-300 hover:bg-white/10"
                            }
                          `}
                        >
                          <Link
                            href={`/chat/${chat._id}`}
                            className="flex flex-1 items-center gap-3 overflow-hidden"
                          >
                            <MessageSquare
                              size={16}
                            />

                            <span className="truncate text-sm">
                              {chat.title}
                            </span>
                          </Link>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              deleteChat(chat._id);
                            }}
                            className="
                              opacity-0
                              group-hover:opacity-100
                              transition
                              p-1.5
                              rounded-full
                              hover:bg-white/10
                            "
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

            {/* Bottom */}
            <div className="border-t border-white/10 p-4 space-y-4">
              <ModelSelector
                selectedModel={selectedModel}
                onModelSelect={setSelectedModel}
              />

              <Link
                href="/settings"
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  p-3
                  text-gray-400
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <Settings size={20} />
                <span>Settings</span>
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}