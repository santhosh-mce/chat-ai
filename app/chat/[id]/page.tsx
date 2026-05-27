"use client";

import { useStore } from "@/store/useStore";
import { useEffect, useState, use } from "react";
import ChatWindow from "@/components/ChatWindow";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useStore();
  const router = useRouter();
  const [chatData, setChatData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    
    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chats/${resolvedParams.id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setChatData(data);
        } else {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error(error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [user, resolvedParams.id]);

  if (loading || !user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return <ChatWindow chatId={resolvedParams.id} initialMessages={chatData?.messages || []} />;
}
