"use client";

import { type FC, useEffect, useRef } from "react";
import { useConversations } from "../hooks";
import type { Conversation } from "@/lib/db";

const ConversationItem: FC<{ conversation: Conversation }> = ({ conversation }) => {
  const updatedAt = new Date(conversation.updatedAt).toLocaleDateString();

  return (
    <li className="flex flex-col gap-1 rounded-md px-3 py-2 hover:bg-muted cursor-pointer transition-colors">
      <span className="text-sm font-medium truncate">
        {conversation.title ?? "Untitled"}
      </span>
      <span className="text-xs text-muted-foreground">{updatedAt}</span>
    </li>
  );
};

export const ConversationList: FC = () => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversations();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) {
    return <p className="px-3 py-2 text-sm text-muted-foreground">Loading...</p>;
  }

  if (isError) {
    return <p className="px-3 py-2 text-sm text-destructive">Failed to load conversations.</p>;
  }

  const conversations = data?.pages.flatMap((page) => page.data) ?? [];

  if (!conversations.length) {
    return <p className="px-3 py-2 text-sm text-muted-foreground">No conversations yet.</p>;
  }

  return (
    <>
      <ul className="flex flex-col gap-1">
        {conversations.map((conversation) => (
          <ConversationItem key={conversation.id} conversation={conversation} />
        ))}
      </ul>
      <div ref={sentinelRef} />
      {isFetchingNextPage && (
        <p className="px-3 py-2 text-sm text-muted-foreground">Loading more...</p>
      )}
    </>
  );
};
