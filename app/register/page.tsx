"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  const router = useRouter();
  const { user } = useStore();

  useEffect(() => {
    if (user?.token) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  return (
    <div className="h-full flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#09090b] to-[#09090b]">
      <AuthForm type="register" />
    </div>
  );
}
