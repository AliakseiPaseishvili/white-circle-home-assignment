import { Chat } from "@/features/chat";

export default function Home() {
  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col p-4">
      <Chat />
    </main>
  );
}
