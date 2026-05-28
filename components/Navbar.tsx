"use client";

import { Menu, UserCircle } from "lucide-react";
import { useStore } from "@/store/useStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { toggleSidebar, user, logout } = useStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      router.replace("/login");
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/login");
      }
    }
  };

  return (
    <nav className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <Menu size={24} />
        </button>
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Gemini Clone
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden md:block">{user.name}</span>
            <button onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors text-white">
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors text-white">
            <UserCircle size={20} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
