"use client";

import { Menu, UserCircle } from "lucide-react";

import { useStore } from "@/store/useStore";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const {
    toggleSidebar,
    user,
    logout,
  } = useStore();

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error(error);
    } finally {
      logout();
      router.replace("/login");
    }
  };

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        w-full
        flex
        h-16
        items-center
        justify-between
        border-b
        border-white/10
        bg-black/70
        px-4
        backdrop-blur-xl
      "
    >
      <div className="flex items-center gap-4">
        
        {/* Menu Button */}
        <button
          onClick={toggleSidebar}
          className="
            rounded-full
            p-2
            text-white
            hover:bg-white/10
            md:hidden
          "
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link
          href="/dashboard"
          className="
            text-xl
            font-bold
            bg-gradient-to-r
            from-blue-400
            to-purple-500
            bg-clip-text
            text-transparent
          "
        >
          Gemini Clone
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="hidden text-sm text-gray-300 md:block">
              {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="
                rounded-full
                bg-white/10
                px-4
                py-2
                text-sm
                text-white
                transition
                hover:bg-white/20
              "
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-white/10
              px-4
              py-2
              text-white
              hover:bg-white/20
            "
          >
            <UserCircle size={20} />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
}