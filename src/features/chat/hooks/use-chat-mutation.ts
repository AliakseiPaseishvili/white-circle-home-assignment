import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";

type UseChatMutation = {
  onSuccess?: (content: string) => void;
  onStreamingContentChange: (content: string) => void;
  onConversationId?: (id: string) => void;
};

type MutationArgs = {
  message: string;
  conversationId?: string | null;
};

export const useChatMutation = ({ onSuccess, onStreamingContentChange, onConversationId }: UseChatMutation) => {

  return useMutation({
    mutationFn: async ({ message, conversationId }: MutationArgs) => {
      const response = await api.chat.post({
        message,
        ...(conversationId ? { conversationId } : {}),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (!line.startsWith("data: ")) continue;
            const data = JSON.parse(line.slice(6));
            if (data.type === "conversation_id") {
              onConversationId?.(data.id as string);
            } else if (
              data.type === "content_block_delta" &&
              data.delta?.type === "text_delta"
            ) {
              assistantContent += data.delta.text;
              onStreamingContentChange(assistantContent);
            }
          }
        }
      }

      return assistantContent;
    },
    onMutate: () => {
      onStreamingContentChange("");
    },
    onSuccess: (assistantContent) => {
      onSuccess?.(assistantContent);
    },
  });
};
