import OpenAI from "openai";

import type { Job } from "../domain/Job.js";
import type { ResumeSection } from "../domain/ResumeSection.js";
import type { TailoredResumeResult } from "../domain/TailoredResumeResult.js";
import type { CandidateProfileConfig } from "../domain/CandidateProfileConfig.js";

import { ResumeSectionSchema } from "../domain/ResumeSection.js";
import { extractJSON } from "../domain/extractJSONHelper.js";
import { buildPromptForResumeTailor } from "../domain/buildPromptForResumeTailor.js";
import { logTokenUsage } from "../domain/tokenUsageLogger.js";
import { retryLLMWithBackoff } from "../utils/retryLLMWithBackOff.js";
import type { ITailorResume } from "./ITailorResume.js";
import { ResumeTailorError, EmptyLLMResponseError, InvalidLLMContentError, ResumeValidationError } from "../domain/ResumeTailorError.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class OpenAIResumeTailor implements ITailorResume {
  sourceName = "OpenAIResumeTailor";

  // =====================================================
  // ✅ SINGLE JOB (PRIMARY API)
  // =====================================================
  async tailorResumeAsync(
    job: Job,
    candidateProfileConfig: CandidateProfileConfig
  ): Promise<TailoredResumeResult> {
    try {

      if (!candidateProfileConfig.resumeText?.trim()) {
        throw new Error("Candidate resume text is empty.");
      }

      const prompt = buildPromptForResumeTailor(job, candidateProfileConfig);

      if (!prompt) {
        throw new Error("Prompt is empty.");
      }

      const response = await retryLLMWithBackoff(() =>
        client.chat.completions.create({
          model: "gpt-4o",
          temperature: 0.4,
          messages: [{ role: "user", content: prompt }],
        })
      );

      logTokenUsage(this.sourceName, "gpt-4o", response.usage);

      const message = response.choices?.[0]?.message;
      if (!message?.content) {
        throw new EmptyLLMResponseError(job.id);
      }

      const content = this.normalizeContent(message.content);
      if (!content) {
        throw new InvalidLLMContentError(job.id);
      }

      const parsed = extractJSON(content);

      const result = ResumeSectionSchema.safeParse(parsed);
      if (!result.success) {
        throw new ResumeValidationError(job.id, result.error);
      }

      return this.buildResult(job, result.data);

    } catch (err) {
      console.error(`❌ Resume tailoring failed for job ${job.id}:`, err);
      throw err; // 🔥 important: propagate
    }
  }

  // =====================================================
  // 🔧 HELPERS
  // =====================================================
  private normalizeContent(contentRaw: unknown): string | null {
    if (typeof contentRaw === "string") return contentRaw;

    if (Array.isArray(contentRaw)) {
      return contentRaw
        .map((p: any) => ("text" in p ? p.text : ""))
        .join("");
    }

    return null;
  }

  private buildResult(
    job: Job,
    resume: ResumeSection
  ): TailoredResumeResult {
    return {
      job,
      jobScore: job.relevanceScore?.score,
      resume,
      createdAt: new Date().toISOString(),
    };
  }
}