"use client";

import { useEffect, useRef, useState } from "react";
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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
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
          chatId,
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
      <div className="absolute top-0 w-full p-4 flex justify-end z-10 pointer-events-none">
        <div className="pointer-events-auto">
          <ModelSelector selectedModel={model} onModelSelect={setModel} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-32 pt-16">
        <div className="max-w-4xl mx-auto flex flex-col min-h-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
                How can I help you today?
              </h1>
              <p className="text-gray-400 max-w-lg">
                I can help you write code, brainstorm ideas, draft emails, and much more. Just type your prompt below.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
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
                <div className="p-4 md:p-6 bg-white/5 flex gap-4">
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
