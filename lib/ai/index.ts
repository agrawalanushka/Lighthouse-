import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeMessageParams {
  prompt: string;
  maxTokens?: number;
  system?: string;
}

export async function callClaude({
  prompt,
  maxTokens = 1024,
  system,
}: ClaudeMessageParams): Promise<string> {
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: system || "You are a helpful assistant.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textContent = message.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    return textContent.text;
  } catch (error) {
    console.error("Claude API error:", error);
    throw error;
  }
}

export { client as anthropic };
