import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import { type ChatMessage } from "../context";

type UseChatMutation = {
  onSuccess?: (content: string) => void;
  onStreamingContentChange: (content: string) => void;
};

export const useChatMutation = ({ onSuccess, onStreamingContentChange}: UseChatMutation) => {

  return useMutation({
    mutationFn: async (messages: ChatMessage[]) => {
      const response = await api.chat.post({ messages });
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
            if (
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
