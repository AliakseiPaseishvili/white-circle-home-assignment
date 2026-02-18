"use client";

import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useState } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatContextValue = {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  streamingContent: string;
  setStreamingContent: Dispatch<SetStateAction<string>>;
  conversationId: string | null;
  setConversationId: Dispatch<SetStateAction<string | null>>;
};

export const ChatContext = createContext<ChatContextValue>({
  messages: [],
  setMessages: () => {},
  streamingContent: "",
  setStreamingContent: () => {},
  conversationId: null,
  setConversationId: () => {},
});

export const ChatProvider: FC<PropsWithChildren> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);

  return (
    <ChatContext.Provider
      value={{ messages, setMessages, streamingContent, setStreamingContent, conversationId, setConversationId }}
    >
      {children}
    </ChatContext.Provider>
  );
};
