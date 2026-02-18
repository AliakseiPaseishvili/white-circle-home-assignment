import { client } from "./constants";

export type PiiMapping = Record<string, string>;

type PiiMaskResult = {
  maskedText: string;
  mapping: PiiMapping;
  nextIndex: number;
};

const PII_SYSTEM_PROMPT = `You are a PII masking assistant. Use the mask_pii tool to identify and replace personally identifiable information in the given text.

PII types to detect:
- EMAIL: email addresses
- PHONE: phone numbers
- NAME: full names (first + last combinations)
- ADDRESS: physical addresses
- SSN: social security numbers
- CREDIT_CARD: credit card numbers
- DOB: dates of birth
- IP_ADDRESS: IP addresses
- ID_NUMBER: passport or national ID numbers

Always call the mask_pii tool, even when no PII is found.`;

export async function maskPii(
  text: string,
  startIndex: number = 1,
): Promise<PiiMaskResult> {
  if (!text.trim()) return { maskedText: text, mapping: {}, nextIndex: startIndex };

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: PII_SYSTEM_PROMPT,
      tools: [
        {
          name: "mask_pii",
          description:
            "Replace PII in the text with numbered placeholders like [EMAIL_1], [NAME_2]. " +
            `Number placeholders sequentially starting from ${startIndex}.`,
          input_schema: {
            type: "object" as const,
            properties: {
              maskedText: {
                type: "string",
                description: "The original text with PII replaced by [TYPE_N] placeholders.",
              },
              mapping: {
                type: "object",
                description: 'Map of placeholder key to original value, e.g. {"EMAIL_1": "john@doe.com"}.',
                additionalProperties: { type: "string" },
              },
              nextIndex: {
                type: "integer",
                description: "The next sequential index to use after all replacements in this chunk.",
              },
            },
            required: ["maskedText", "mapping", "nextIndex"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "mask_pii" },
      messages: [{ role: "user", content: text }],
    });

    const toolUse = response.content.find(
      (block) => block.type === "tool_use" && block.name === "mask_pii",
    );
    if (!toolUse || toolUse.type !== "tool_use") {
      return { maskedText: text, mapping: {}, nextIndex: startIndex };
    }

    const input = toolUse.input as Partial<PiiMaskResult>;
    return {
      maskedText: input.maskedText ?? text,
      mapping: input.mapping ?? {},
      nextIndex: input.nextIndex ?? startIndex,
    };
  } catch {
    return { maskedText: text, mapping: {}, nextIndex: startIndex };
  }
}

export class PiiMaskingBuffer {
  private buffer = "";
  private index = 1;
  readonly mapping: PiiMapping = {};
  private readonly flushThreshold: number;

  constructor(flushThreshold = 50) {
    this.flushThreshold = flushThreshold;
  }

  add(text: string): void {
    this.buffer += text;
  }

  get hasContent(): boolean {
    return this.buffer.length > 0;
  }

  shouldFlush(): boolean {
    if (this.buffer.length < this.flushThreshold) return false;
    return /[.!?\n]/.test(this.buffer);
  }

  async flush(): Promise<string> {
    const text = this.buffer;
    this.buffer = "";
    const { maskedText, mapping, nextIndex } = await maskPii(text, this.index);
    this.index = nextIndex;
    Object.assign(this.mapping, mapping);
    return maskedText;
  }
}
