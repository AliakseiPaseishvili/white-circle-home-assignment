import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { Conversation } from "@/lib/db";

type ConversationsResponse = {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type UseConversationsOptions = {
  limit?: number;
};

export const useConversations = ({ limit = 20 }: UseConversationsOptions = {}) => {
  return useInfiniteQuery<ConversationsResponse>({
    queryKey: ["conversations", { limit }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await api.conversations.list({ page: pageParam as number, limit });
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length === 0) return undefined;
      const nextPage = lastPage.page + 1;
      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
  });
};
