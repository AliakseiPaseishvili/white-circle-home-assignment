type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatPostBody = {
  messages: ChatMessage[];
  model?: string;
  max_tokens?: number;
  conversationId?: string;
};

type PaginatedQuery = {
  page?: number;
  limit?: number;
};

export const API_ROUTES = {
  chat: "/api/chat",
  conversations: "/api/conversations",
  conversationMessages: (id: string) => `/api/conversations/${id}/messages`,
} as const;

export const api = {
  chat: {
    post: (body: ChatPostBody): Promise<Response> =>
      fetch(API_ROUTES.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  },
  conversations: {
    list: ({ page = 1, limit = 20 }: PaginatedQuery = {}): Promise<Response> =>
      fetch(`${API_ROUTES.conversations}?page=${page}&limit=${limit}`),
    messages: (id: string, { page = 1, limit = 50 }: PaginatedQuery = {}): Promise<Response> =>
      fetch(`${API_ROUTES.conversationMessages(id)}?page=${page}&limit=${limit}`),
  },
};
