import { yupResolver } from "@hookform/resolvers/yup";
import { use, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { type ChatMessage } from "../context";
import { ChatContext } from "../context/ChatContext";
import { useChatMutation } from "./use-chat-mutation";

const schema = yup.object({
  message: yup.string().trim().required("Message is required"),
});

export type ChatInputValues = yup.InferType<typeof schema>;

export const useChatInput = () => {
  const { messages, setMessages, setStreamingContent } = use(ChatContext);
  const { mutate, isPending } = useChatMutation({
    onSuccess: (content: string) => {
      setMessages((prev) => [...prev, { role: "assistant", content }]);
      setStreamingContent("");
    },
    onStreamingContentChange: setStreamingContent,
  });

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
      mutate(updatedMessages);
    },
    [messages, setMessages, form, mutate],
  );

  const handleSubmit = form.handleSubmit(onFormSubmit);

  return { form, handleSubmit, isPending };
};
