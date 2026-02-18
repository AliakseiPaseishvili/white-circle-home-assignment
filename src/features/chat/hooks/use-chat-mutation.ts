import { useMutation } from "@tanstack/react-query";
import { api } from "@/api";
import type { PiiMapping } from "../context/ChatContext";

type MutationResult = {
  content: string;
  maskedContent?: string;
  piiMapping: PiiMapping;
};

type UseChatMutation = {
  onSuccess?: (result: MutationResult) => void;
  onStreamingContentChange: (content: string) => void;
  onConversationId?: (id: string) => void;
  onPiiMapping?: (mapping: PiiMapping) => void;
};

type MutationArgs = {
  message: string;
  conversationId?: string | null;
};

export const useChatMutation = ({ onSuccess, onStreamingContentChange, onConversationId, onPiiMapping }: UseChatMutation) => {

  return useMutation({
    mutationFn: async ({ message, conversationId }: MutationArgs): Promise<MutationResult> => {
      const response = await api.chat.post({
        message,
        ...(conversationId ? { conversationId } : {}),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamingContent = "";
      let piiMapping: PiiMapping = {};
      let originalContent = "";
      let maskedContent: string | undefined;

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
              streamingContent += data.delta.text;
              onStreamingContentChange(streamingContent);
            } else if (data.type === "pii_mapping") {
              piiMapping = { ...piiMapping, ...(data.mapping as PiiMapping) };
              onPiiMapping?.(piiMapping);
            } else if (data.type === "final_message") {
              originalContent = data.originalContent as string;
              maskedContent = data.maskedContent as string;
            }
          }
        }
      }

      return { content: originalContent || streamingContent, maskedContent, piiMapping };
    },
    onMutate: () => {
      onStreamingContentChange("");
    },
    onSuccess: (result) => {
      onSuccess?.(result);
    },
  });
};
