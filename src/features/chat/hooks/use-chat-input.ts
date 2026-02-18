import { yupResolver } from "@hookform/resolvers/yup";
import { use, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { api } from "@/api";
import { type ChatMessage } from "../context";
import { ChatContext } from "../context/ChatContext";

const schema = yup.object({
  message: yup.string().trim().required("Message is required"),
});

export type ChatInputValues = yup.InferType<typeof schema>;

export const useChatInput = () => {
  const { messages, setMessages, setStreamingContent } = use(ChatContext);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChatInputValues>({
    resolver: yupResolver(schema),
    defaultValues: { message: "" },
  });

  const onFormSubmit = useCallback(
    async (values: ChatInputValues) => {
      const userMessage: ChatMessage = {
        role: "user",
        content: values.message,
      };
      const updatedMessages = [...messages, userMessage];

      setMessages(updatedMessages);
      form.reset();
      setIsLoading(true);
      setStreamingContent("");

      try {
        const response = await api.chat.post({ messages: updatedMessages });
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
                setStreamingContent(assistantContent);
              }
            }
          }
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: assistantContent },
        ]);
        setStreamingContent("");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, form, setMessages, setStreamingContent],
  );

  const handleSubmit = form.handleSubmit(onFormSubmit);

  return { form, handleSubmit, isLoading };
};
