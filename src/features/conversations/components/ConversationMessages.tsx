"use client";

import { use, useEffect, useRef, FC, useMemo } from "react";
import { ChatContext } from "@/features/chat/context/ChatContext";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import { useConversationMessages } from "../hooks/use-conversation-messages";

export const ConversationMessages: FC<{ conversationId: string }> = ({ conversationId }) => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationMessages(conversationId);
  const { messages: newMessages, streamingContent } = use(ChatContext);

  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // API returns newest-first; reverse pages and each page's data for chronological order
  const historicalMessages = useMemo(
    () =>
      data?.pages
        .toReversed()
        .flatMap((page) => [...page.data].reverse()) ?? [],
    [data],
  );

  // Intersection observer at the top to load older messages
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Auto-scroll to bottom on new messages or streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [newMessages, streamingContent]);

  if (isLoading) {
    return <p className="px-3 py-2 text-sm text-muted-foreground">Loading messages...</p>;
  }

  if (isError) {
    return <p className="px-3 py-2 text-sm text-destructive">Failed to load messages.</p>;
  }

  const isEmpty = historicalMessages.length === 0 && newMessages.length === 0 && !streamingContent;

  return (
    <div className="flex flex-col gap-3">
      <div ref={topSentinelRef} />

      {isFetchingNextPage && (
        <p className="px-3 py-2 text-sm text-muted-foreground">Loading older messages...</p>
      )}

      {isEmpty && (
        <p className="px-3 py-2 text-sm text-muted-foreground">No messages yet.</p>
      )}

      {historicalMessages.map((message) => (
        <div
          key={message.id}
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

      {newMessages.map((message, index) => (
        <div
          key={`new-${index}`}
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

      <div ref={bottomRef} />
    </div>
  );
};
