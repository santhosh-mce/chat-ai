"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ModelSelector from "./ModelSelector";
import { useStore } from "@/store/useStore";
import Loader from "./Loader";

interface MessageVersion {
  id: string;
  content: string;
}

interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content?: string;
  versions?: MessageVersion[];
  activeVersion?: number;
}

const normalizeMessage = (message: Message, index: number): Message => {
  if (message.role === "assistant") {
    const versions = message.versions?.length
      ? message.versions.map((version, versionIndex) => ({
          id: version.id || `version-${index}-${versionIndex}`,
          content: version.content || "",
        }))
      : [{ id: `version-${index}-0`, content: message.content || "" }];

    return {
      ...message,
      id: message.id || `msg-assistant-${index}`,
      content: versions[message.activeVersion ?? 0]?.content || "",
      versions,
      activeVersion: Math.min(message.activeVersion ?? 0, versions.length - 1),
    };
  }

  return {
    ...message,
    id: message.id || `msg-user-${index}`,
    content: message.content || "",
  };
};

export default function ChatWindow({ chatId, initialMessages = [] }: { chatId?: string, initialMessages?: Message[] }) {
  const [messages, setMessages] = useState<Message[]>(() =>
    initialMessages.map((message, index) => normalizeMessage(message, index))
  );
  const [isLoading, setIsLoading] = useState(false);
  const model = useStore((state) => state.selectedModel);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useStore();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      bottomRef.current?.scrollIntoView({
        behavior: isLoading ? "auto" : "smooth",
        block: "end",
      });
    }, 100);

    return () => window.clearTimeout(timeout);
  }, [messages, isLoading]);

  const streamResponse = async ({
    historyMessages,
    targetId,
    createVersion = false,
    chatIdOverride,
  }: {
    historyMessages: Message[];
    targetId?: string;
    createVersion?: boolean;
    chatIdOverride?: string;
  }) => {
    const assistantMessage: Message = {
      id: targetId || `msg-assistant-${Date.now()}`,
      role: "assistant",
      versions: [{ id: `version-${Date.now()}-0`, content: "" }],
      activeVersion: 0,
      content: "",
    };

    if (createVersion) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === targetId
            ? {
                ...msg,
                versions: [
                  ...(msg.versions || []),
                  { id: `version-${Date.now()}-regen`, content: "" },
                ],
                activeVersion: (msg.versions?.length || 0),
                content: "",
              }
            : msg
        )
      );
    } else {
      setMessages((prev) => [...prev, assistantMessage]);
    }

    const streamTargetId = createVersion ? targetId : assistantMessage.id;

    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          messages: historyMessages,
          model,
          chatId: chatIdOverride || chatId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
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
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantContent += decoder.decode(value, { stream: true });

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== streamTargetId) return msg;

              const versions = [...(msg.versions || [])];
              const activeVersion = msg.activeVersion ?? 0;

              if (createVersion) {
                versions[activeVersion + 1] = {
                  id: versions[activeVersion + 1]?.id || `version-${Date.now()}-regen`,
                  content: assistantContent,
                };
              } else {
                versions[0] = { id: versions[0]?.id || `version-${Date.now()}-0`, content: assistantContent };
              }

              return {
                ...msg,
                content: assistantContent,
                versions,
                activeVersion: createVersion ? activeVersion + 1 : 0,
              };
            })
          );
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Chat error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== streamTargetId) return msg;

            const versions = [...(msg.versions || [])];
            if (createVersion) {
              versions[versions.length - 1] = {
                id: versions[versions.length - 1]?.id || `version-${Date.now()}-regen`,
                content: `❌ Error: ${errorMessage}`,
              };
            } else {
              versions[0] = { id: versions[0]?.id || `version-${Date.now()}-0`, content: `❌ Error: ${errorMessage}` };
            }

            return {
              ...msg,
              content: `❌ Error: ${errorMessage}`,
              versions,
              activeVersion: createVersion ? versions.length - 1 : 0,
            };
          })
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content,
    };
    const newMessages: Message[] = [...messages, userMessage];
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
      await streamResponse({
        historyMessages: newMessages,
        targetId: undefined,
        createVersion: false,
        chatIdOverride: activeChatId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const regenerateResponse = async (messageId: string) => {
    const targetIndex = messages.findIndex((msg) => msg.id === messageId);

    if (targetIndex < 0 || messages[targetIndex].role !== "assistant") return;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              versions: [
                ...(msg.versions || []),
                { id: `version-${Date.now()}-regen`, content: "" },
              ],
              activeVersion: (msg.versions?.length || 0),
              content: "",
            }
          : msg
      )
    );

    setIsLoading(true);

    try {
      await streamResponse({
        historyMessages: messages.slice(0, targetIndex),
        targetId: messageId,
        createVersion: true,
        chatIdOverride: chatId,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#09090b] relative overflow-hidden">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6 pt-16">
        <div className="flex min-h-full w-full flex-col px-3 sm:px-4">
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
              {messages.map((msg, idx) => {
                const activeVersion = msg.role === "assistant"
                  ? msg.versions?.[msg.activeVersion ?? 0]
                  : null;

                return (
                  <MessageBubble
                    key={msg.id ?? `${msg.role}-${idx}`}
                    role={msg.role}
                    messageId={msg.id}
                    content={msg.role === "assistant" ? activeVersion?.content || "" : msg.content || ""}
                    versions={msg.role === "assistant" ? msg.versions : undefined}
                    activeVersion={msg.role === "assistant" ? msg.activeVersion ?? 0 : undefined}
                    setMessages={setMessages}
                    isLast={idx === messages.length - 1}
                    onRegenerate={msg.role === "assistant" ? () => regenerateResponse(msg.id || "") : undefined}
                  />
                );
              })}
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
 
      <div className="sticky bottom-0 z-10 w-full shrink-0 border-t border-white/10 bg-black/20 backdrop-blur-md">
        <ChatInput onSend={handleSend} isLoading={isLoading} onStop={handleStop} />
      </div>
    </div>
  );
}
