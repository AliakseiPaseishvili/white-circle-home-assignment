import Anthropic from "@anthropic-ai/sdk";

export const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});
