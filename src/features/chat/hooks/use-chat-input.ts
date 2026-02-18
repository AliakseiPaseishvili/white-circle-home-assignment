import { yupResolver } from "@hookform/resolvers/yup";
import { use, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ChatContext } from "../context/ChatContext";
import { useChatMutation } from "./use-chat-mutation";

const schema = yup.object({
  message: yup.string().trim().required("Message is required"),
});

export type ChatInputValues = yup.InferType<typeof schema>;

export const useChatInput = () => {
  const { setMessages, setStreamingContent, conversationId, setConversationId } = use(ChatContext);
  const { mutate, isPending } = useChatMutation({
    onSuccess: (content: string) => {
      setMessages((prev) => [...prev, { role: "assistant", content }]);
      setStreamingContent("");
    },
    onStreamingContentChange: setStreamingContent,
    onConversationId: setConversationId,
  });

  const form = useForm<ChatInputValues>({
    resolver: yupResolver(schema),
    defaultValues: { message: "" },
  });

  const onFormSubmit = useCallback(
    async (values: ChatInputValues) => {
      setMessages((prev) => [...prev, { role: "user", content: values.message }]);
      form.reset();
      mutate({ message: values.message, conversationId });
    },
    [setMessages, form, mutate, conversationId],
  );

  const handleSubmit = form.handleSubmit(onFormSubmit);

  return { form, handleSubmit, isPending };
};
