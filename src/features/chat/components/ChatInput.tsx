"use client";

import { FC, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useChatInput } from "../hooks";

export const ChatInput: FC = () => {
  const { form, handleSubmit, isPending } = useChatInput();

  const {
    register,
    formState: { errors, isValid },
  } = form;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Textarea
          {...register("message")}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          rows={4}
          aria-invalid={!!errors.message}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={!isValid || isPending}
        className="self-end"
      >
        {isPending ? "Sending..." : "Send"}
      </Button>
    </form>
  );
};
