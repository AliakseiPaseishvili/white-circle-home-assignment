import { Chat } from "@/features/chat";
import { ConversationList } from "@/features/conversations";

export default function Home() {
  return (
    <main className="flex h-screen">
      <aside className="w-64 shrink-0 overflow-y-auto border-r p-3">
        <ConversationList />
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <Chat />
      </div>
    </main>
  );
}
