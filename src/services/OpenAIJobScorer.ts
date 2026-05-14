import OpenAI from "openai";
import type { Job } from "../domain/Job.js";
import { JobScoreSchema } from "../domain/JobScore.js";
import type { JobScore } from "../domain/JobScore.js";
import type { IScoreJob } from "./IScoreJob.js";
import { buildPromptForJobScore } from "../domain/buildPromptForJobScore.js";
import { extractJSON } from "../domain/extractJSONHelper.js";
import type { CandidateProfileConfig } from "../domain/CandidateProfileConfig.js";
import { logTokenUsage } from "../domain/tokenUsageLogger.js";
import { retryLLMWithBackoff } from "../utils/retryLLMWithBackOff.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIJobScorer implements IScoreJob {
  sourceName = "OpenAI";

  /**
   * Primary method: process ONE job
   */
  async scoreJobAsync(
    job: Job,
    candidateProfileConfig: CandidateProfileConfig
  ): Promise<Job> {
    try {
      if (!candidateProfileConfig.resumeText?.trim()) {
        throw new Error("Resume Text input is empty.");
      }

      const prompt = buildPromptForJobScore(job, candidateProfileConfig);

      const response = await retryLLMWithBackoff(() =>
        client.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.2,
          messages: [{ role: "user", content: prompt }],
        })
      );

      logTokenUsage(this.sourceName, "gpt-4o-mini", response.usage);

      const message = response.choices?.[0]?.message;
      if (!message?.content) {
        return this.failedJob(job);
      }

      const content = this.normalizeContent(message.content);
      if (!content) {
        return this.failedJob(job);
      }

      const parsed = extractJSON(content);
      const result = JobScoreSchema.safeParse(parsed);

      if (!result.success) {
        console.error("Validation failed:", result.error);
        return this.failedJob(job);
      }

      return {
        ...job,
        scoringStatus: "scored",
        relevanceScore: result.data,
      };

    } catch (err) {
      console.error(`Error scoring job ${job.id}:`, err);
      return this.failedJob(job);
    }
  }

  /**
   * 🔹 Helpers
   */
  private normalizeContent(contentRaw: unknown): string | null {
    if (typeof contentRaw === "string") return contentRaw;

    if (Array.isArray(contentRaw)) {
      return contentRaw
        .map((p: any) => ("text" in p ? p.text : ""))
        .join("");
    }

    return null;
  }

  private failedJob(job: Job): Job {
    return {
      ...job,
      scoringStatus: "failed",
    };
  }
}