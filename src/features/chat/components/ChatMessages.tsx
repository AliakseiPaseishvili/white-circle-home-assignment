"use client";

import { use } from "react";
import { FC } from "react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { ChatContext } from "../context/ChatContext";

export const ChatMessages: FC = () => {
  const { messages, streamingContent } = use(ChatContext);

  if (messages.length === 0 && !streamingContent) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            "max-w-[80%] rounded-lg px-4 py-2 text-sm",
            message.role === "user"
              ? "self-end bg-primary text-primary-foreground"
              : "self-start bg-muted text-muted-foreground",
          )}
        >
          <Markdown
            content={message.content}
            className={message.role === "user" ? "prose-invert" : undefined}
          />
        </div>
      ))}
      {streamingContent && (
        <div className="max-w-[80%] self-start rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
          <Markdown content={streamingContent} />
          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current" />
        </div>
      )}
    </div>
  );
};
