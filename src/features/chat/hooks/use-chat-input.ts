import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object({
  message: yup.string().trim().required("Message is required"),
});

export type ChatInputValues = yup.InferType<typeof schema>;

export const useChatInput = (onSubmit?: (values: ChatInputValues) => void) => {
  const form = useForm<ChatInputValues>({
    resolver: yupResolver(schema),
    defaultValues: { message: "" },
  });

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit?.(values);
    form.reset();
  });

  return { form, handleSubmit };
};
