import { FC, PropsWithChildren } from "react";
import { ConversationList, NewConversationButton } from "@/features/conversations";

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="flex h-screen">
      <aside className="flex w-64 shrink-0 flex-col gap-3 overflow-y-auto border-r p-3">
        <NewConversationButton />
        <ConversationList />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        {children}
      </div>
    </main>
  );
};

export default MainLayout;
