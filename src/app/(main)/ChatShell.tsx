"use client";

import { use, useEffect, FC } from "react";
import { usePathname } from "next/navigation";
import { ChatProvider, ChatInput, Messages } from "@/features/chat";
import { ChatContext } from "@/features/chat/context/ChatContext";

const ChatPanel: FC = () => {
  const pathname = usePathname();
  const { setConversationId, setMessages, setStreamingContent } = use(ChatContext);

  // Sync URL route → context. When IDs already match (streaming auto-nav), skip reset.
  useEffect(() => {
    const match = pathname.match(/^\/conversations\/(.+)$/);
    const urlConversationId = match?.[1] ?? null;

    setConversationId((current) => {
      if (current !== urlConversationId) {
        setMessages([]);
        setStreamingContent("");
        return urlConversationId;
      }
      return current;
    });
  }, [pathname, setConversationId, setMessages, setStreamingContent]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Messages />
      </div>
      <ChatInput />
    </div>
  );
};

export const ChatShell: FC = () => {
  return (
    <ChatProvider>
      <ChatPanel />
    </ChatProvider>
  );
};
