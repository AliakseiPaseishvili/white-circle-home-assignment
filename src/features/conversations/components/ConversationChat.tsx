import { FC } from "react";
import { ChatProvider, ChatInput } from "@/features/chat";
import { ConversationMessages } from "./ConversationMessages";

export const ConversationChat: FC<{ conversationId: string }> = ({ conversationId }) => {
  return (
    <ChatProvider initialConversationId={conversationId}>
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <ConversationMessages conversationId={conversationId} />
        </div>
        <ChatInput />
      </div>
    </ChatProvider>
  );
};
