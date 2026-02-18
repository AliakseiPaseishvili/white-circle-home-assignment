import { client } from "@/features/claude";

export async function POST(request: Request) {
  const { messages, model = "claude-sonnet-4-6", max_tokens = 1024 } = await request.json();

  const stream = client.messages.stream({
    model,
    max_tokens,
    messages,
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      for await (const event of stream) {
        const data = JSON.stringify(event);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
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
