import { client } from "@/features/claude";
import { db, conversations, messages } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const {
    messages: chatMessages,
    model = "claude-sonnet-4-6",
    max_tokens = 1024,
    conversationId: incomingConversationId,
  } = await request.json();

  let conversationId: string;

  if (incomingConversationId) {
    const [existing] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.id, incomingConversationId))
      .limit(1);

    conversationId = existing?.id ?? (await createConversation());
  } else {
    conversationId = await createConversation();
  }

  const userMessage = chatMessages[chatMessages.length - 1];
  await db.insert(messages).values({
    conversationId,
    role: "user",
    content: userMessage.content,
  });

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  const stream = client.messages.stream({
    model,
    max_tokens,
    messages: chatMessages,
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const idEvent = JSON.stringify({ type: "conversation_id", id: conversationId });
      controller.enqueue(encoder.encode(`data: ${idEvent}\n\n`));

      let assistantContent = "";

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "text_delta"
        ) {
          assistantContent += event.delta.text;
        }

        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      if (assistantContent) {
        await db.insert(messages).values({
          conversationId,
          role: "assistant",
          content: assistantContent,
        });

        await db
          .update(conversations)
          .set({ updatedAt: new Date() })
          .where(eq(conversations.id, conversationId));
      }

      controller.close();
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function createConversation(): Promise<string> {
  const [created] = await db
    .insert(conversations)
    .values({})
    .returning({ id: conversations.id });
  return created.id;
}
