"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import { useStore } from "@/store/useStore";
import Loader from "./Loader";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatWindow({ chatId, initialMessages = [] }: { chatId?: string, initialMessages?: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("z-ai/glm-4.5-air:free");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useStore();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    const firstTitle = content.length > 30 ? `${content.slice(0, 30)}...` : content;

    let activeChatId = chatId;

    if (!activeChatId && user) {
      const chatRes = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ title: firstTitle }),
      });

      if (!chatRes.ok) {
        throw new Error("Failed to create a conversation");
      }

      const createdChat = await chatRes.json();
      activeChatId = createdChat._id;
      router.replace(`/chat/${createdChat._id}`);
    }

    setMessages(newMessages);
    setIsLoading(true);

    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          messages: newMessages,
          model,
          chatId: activeChatId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        // Try to parse error message from response
        let errorMessage = `HTTP ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(`API Error: ${errorMessage}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          assistantContent += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].content = assistantContent;
            return updated;
          });
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
        // Remove the user message since request was aborted
        setMessages((prev) => prev.slice(0, -1));
      } else {
        console.error("Chat error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        
        // Add error message as assistant response
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `❌ Error: ${errorMessage}` },
        ]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] relative">
      <div className="absolute top-0 w-full p-3 sm:p-4 flex justify-end z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <ModelSelector selectedModel={model} onModelSelect={setModel} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-32 pt-16">
        <div className="w-full max-w-5xl mx-auto flex flex-col min-h-full px-4 sm:px-6 md:px-8">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-2 sm:px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
                How can I help you today?
              </h1>
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
                I can help you write code, brainstorm ideas, draft emails, and much more. Just type your prompt below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:gap-6">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={idx}
                  role={msg.role}
                  content={msg.content}
                  isLast={idx === messages.length - 1}
                  onRegenerate={() => handleSend(messages[messages.length - 2].content)}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 md:p-8 shadow-xl shadow-black/20 flex gap-4">
                  <div className="shrink-0 mt-1">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center" />
                  </div>
                  <div className="flex items-center">
                    <Loader />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pt-10">
        <ChatInput onSend={handleSend} isLoading={isLoading} onStop={handleStop} />
      </div>
    </div>
  );
}
