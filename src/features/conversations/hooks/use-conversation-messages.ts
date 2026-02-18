import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/api";
import type { Message } from "@/lib/db";

type MessagesPage = {
  data: Message[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const useConversationMessages = (conversationId: string) => {
  return useInfiniteQuery<MessagesPage>({
    queryKey: ["conversation-messages", conversationId],
    queryFn: async ({ pageParam }) => {
      const response = await api.conversations.messages(conversationId, { page: pageParam as number });
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
};
