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
};

export const ChatContext = createContext<ChatContextValue>({
  messages: [], 
  setMessages: () => {},
  streamingContent: '',
  setStreamingContent: () => {},
});

export const ChatProvider: FC<PropsWithChildren> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");

  return (
    <ChatContext.Provider value={{ messages, setMessages, streamingContent, setStreamingContent }}>
      {children}
    </ChatContext.Provider>
  );
};
