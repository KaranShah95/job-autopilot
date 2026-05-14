// domain/tokenUsageLogger.ts
export function logTokenUsage(
  source: string,
  model: string,
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  }
) {
  if (!usage) {
    console.log(`📊 [${source}] No token usage returned`);
    return;
  }

  console.log(`\n📊 [${source}] Token Usage (${model})`);
  console.log(`   🧾 Prompt Tokens     : ${usage.prompt_tokens ?? 0}`);
  console.log(`   ✍️ Completion Tokens : ${usage.completion_tokens ?? 0}`);
  console.log(`   📦 Total Tokens      : ${usage.total_tokens ?? 0}`);
}