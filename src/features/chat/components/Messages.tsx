"use client";

import { use, useEffect, useRef, useMemo, FC } from "react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/ui/markdown";
import { PiiText } from "./PiiText";
import { ChatContext } from "../context/ChatContext";
import { useConversationMessages } from "@/features/conversations/hooks";

export const Messages: FC = () => {
  const { messages: newMessages, setMessages, streamingContent, streamingPiiMapping, conversationId } = use(ChatContext);

  const topSentinelRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const clearedForRef = useRef<string | null>(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationMessages(conversationId);

  const historicalMessages = useMemo(
    () =>
      data?.pages
        .toReversed()
        .flatMap((page) => [...page.data].reverse()) ?? [],
    [data],
  );

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

  useEffect(() => {
    if (data && conversationId && clearedForRef.current !== conversationId) {
      clearedForRef.current = conversationId;
      setMessages([]);
    }
  }, [data, conversationId, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [newMessages, streamingContent]);

  if (isError) {
    return <p className="px-3 py-2 text-sm text-destructive">Failed to load messages.</p>;
  }

  const isEmpty =
    historicalMessages.length === 0 && newMessages.length === 0 && !streamingContent;

  return (
    <div className="flex flex-col gap-3">
      <div ref={topSentinelRef} />

      {isFetchingNextPage && (
        <p className="px-3 py-2 text-sm text-muted-foreground">Loading older messages...</p>
      )}

      {isLoading && !newMessages.length && (
        <p className="px-3 py-2 text-sm text-muted-foreground">Loading messages...</p>
      )}

      {!isLoading && isEmpty && (
        <p className="px-3 py-2 text-sm text-muted-foreground">Start a new conversation...</p>
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
          {message.role === "assistant" && message.maskedContent ? (
            <PiiText text={message.maskedContent} mapping={message.piiMapping ?? {}} />
          ) : (
            <Markdown
              content={message.content}
              className={message.role === "user" ? "prose-invert" : undefined}
            />
          )}
        </div>
      ))}

      {streamingContent && (
        <div className="max-w-[80%] self-start rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground">
          <PiiText text={streamingContent} mapping={streamingPiiMapping} />
          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-current" />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
