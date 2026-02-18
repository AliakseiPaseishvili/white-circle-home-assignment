"use client";

import { createContext, Dispatch, FC, PropsWithChildren, SetStateAction, useState } from "react";

export type PiiMapping = Record<string, string>;

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  maskedContent?: string;
  piiMapping?: PiiMapping;
};

type ChatContextValue = {
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  streamingContent: string;
  setStreamingContent: Dispatch<SetStateAction<string>>;
  streamingPiiMapping: PiiMapping;
  setStreamingPiiMapping: Dispatch<SetStateAction<PiiMapping>>;
  conversationId: string | null;
  setConversationId: Dispatch<SetStateAction<string | null>>;
};

export const ChatContext = createContext<ChatContextValue>({
  messages: [],
  setMessages: () => {},
  streamingContent: "",
  setStreamingContent: () => {},
  streamingPiiMapping: {},
  setStreamingPiiMapping: () => {},
  conversationId: null,
  setConversationId: () => {},
});

type ChatProviderProps = PropsWithChildren<{
  initialConversationId?: string;
}>;

export const ChatProvider: FC<ChatProviderProps> = ({ children, initialConversationId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingPiiMapping, setStreamingPiiMapping] = useState<PiiMapping>({});
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId ?? null);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        streamingContent,
        setStreamingContent,
        streamingPiiMapping,
        setStreamingPiiMapping,
        conversationId,
        setConversationId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
