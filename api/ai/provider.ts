import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { listModels } from "./ai-client";

let cachedModelId: string | null = null;

export function kimiGw() {
  const baseURL = process.env.KIMI_AGENTGW_BASE_URL;
  const apiKey = process.env.KIMI_AGENTGW_API_KEY;
  if (!baseURL || !apiKey) {
    throw new Error("KIMI_AGENTGW env vars not injected");
  }
  return createOpenAICompatible({
    name: "kimi-gw",
    baseURL,
    apiKey,
    includeUsage: true,
    supportsStructuredOutputs: true,
  });
}

export async function defaultModelId(): Promise<string> {
  if (cachedModelId) return cachedModelId;
  const { defaultModelId } = await listModels();
  cachedModelId = defaultModelId;
  return defaultModelId;
}
