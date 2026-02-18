import { FC } from "react";
import { ChatProvider } from "../context";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export const Chat: FC = () => {
  return (
    <ChatProvider>
      <div className="flex h-full flex-col gap-4">
        <div className="flex flex-1 flex-col overflow-y-auto">
          <ChatMessages />
        </div>
        <ChatInput />
      </div>
    </ChatProvider>
  );
};
