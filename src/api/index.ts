type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatPostBody = {
  messages: ChatMessage[];
  model?: string;
  max_tokens?: number;
};

export const API_ROUTES = {
  chat: "/api/chat",
} as const;

export type ApiRoute = (typeof API_ROUTES)[keyof typeof API_ROUTES];

export const api = {
  chat: {
    post: (body: ChatPostBody): Promise<Response> =>
      fetch(API_ROUTES.chat, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
  },
};
