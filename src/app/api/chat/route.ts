import { client, PiiMaskingBuffer } from "@/features/claude";
import { db, conversations, messages } from "@/lib/db";
import { asc, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const {
    message,
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

    conversationId = existing?.id ?? (await createConversation(message));
  } else {
    conversationId = await createConversation(message);
  }

  await db.insert(messages).values({
    conversationId,
    role: "user",
    content: message,
  });

  await db
    .update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  const history = await db
    .select({ role: messages.role, content: messages.content })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const stream = client.messages.stream({
    model,
    max_tokens,
    messages: history,
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const idEvent = JSON.stringify({ type: "conversation_id", id: conversationId });
      controller.enqueue(encoder.encode(`data: ${idEvent}\n\n`));

      const piiBuffer = new PiiMaskingBuffer();
      let originalAssistantContent = "";
      let maskedAssistantContent = "";

      const flushBuffer = async () => {
        const maskedChunk = await piiBuffer.flush();
        maskedAssistantContent += maskedChunk;

        if (maskedChunk) {
          const maskedEvent = {
            type: "content_block_delta",
            delta: { type: "text_delta", text: maskedChunk },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(maskedEvent)}\n\n`));
        }

        // Send the latest mapping so the client can reveal tokens
        const mappingEvent = { type: "pii_mapping", mapping: piiBuffer.mapping };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(mappingEvent)}\n\n`));
      };

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "text_delta"
        ) {
          originalAssistantContent += event.delta.text;
          piiBuffer.add(event.delta.text);

          if (piiBuffer.shouldFlush()) {
            await flushBuffer();
          }
        } else {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      }

      // Flush any remaining buffered text
      if (piiBuffer.hasContent) {
        await flushBuffer();
      }

      if (originalAssistantContent) {
        // Send both versions to the client so it can store them in state
        const finalEvent = {
          type: "final_message",
          originalContent: originalAssistantContent,
          maskedContent: maskedAssistantContent || originalAssistantContent,
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalEvent)}\n\n`));

        // Persist the original (unmasked) content in the database
        await db.insert(messages).values({
          conversationId,
          role: "assistant",
          content: originalAssistantContent,
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

function buildTitle(text: string): string {
  return text.length > 50 ? `${text.slice(0, 47)}...` : text;
}

async function createConversation(firstMessage: string): Promise<string> {
  const [created] = await db
    .insert(conversations)
    .values({ title: buildTitle(firstMessage) })
    .returning({ id: conversations.id });
  return created.id;
}
