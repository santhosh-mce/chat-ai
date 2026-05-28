"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useStore } from "@/store/useStore";
import { Loader2 } from "lucide-react";

const publicPaths = new Set(["/", "/login", "/register"]);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, isSidebarOpen } = useStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          setUser(parsed);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      if (window.innerWidth < 768) {
        useStore.setState({ isSidebarOpen: false });
      } else {
        useStore.setState({ isSidebarOpen: true });
      }
      setHydrated(true);
    }
  }, [setUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      if (window.innerWidth < 768) {
        useStore.setState({ isSidebarOpen: false });
      } else {
        useStore.setState({ isSidebarOpen: true });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const isProtected = !publicPaths.has(pathname);

    if (!token && isProtected) {
      router.replace("/login");
    }
  }, [hydrated, pathname, router]);

  const showShell = useMemo(() => {
    if (!hydrated) return false;
    return !publicPaths.has(pathname) && Boolean(user?.token);
  }, [hydrated, pathname, user]);

  if (!hydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b] text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-sm text-gray-300">Checking your session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090b] text-white">
      {showShell ? (
        <>
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className={`flex-1 overflow-hidden ${isSidebarOpen ? "hidden md:block" : "block"}`}>{children}</main>
          </div>
        </>
      ) : (
        <main className="flex-1 overflow-hidden">{children}</main>
      )}
    </div>
  );
}
