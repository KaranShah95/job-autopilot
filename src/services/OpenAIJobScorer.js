import OpenAI from "openai";
import { JobScoreSchema } from "../domain/JobScore.js";
import { buildPromptForJobScore } from "../domain/buildPromptForJobScore.js";
import { extractJSON } from "../domain/extractJSONHelper.js";
import pLimit from "p-limit";
const limit = pLimit(5);
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
export class OpenAIJobScorer {
    resume;
    constructor(resume) {
        this.resume = resume;
    }
    async ScoreJobsAsync(jobs) {
        const results = await Promise.all(jobs.map(job => limit(async () => {
            try {
                const scoreData = await this.scoreJob(job);
                return {
                    ...job,
                    scoringStatus: scoreData ? 'scored' : 'failed',
                    relevanceScore: scoreData ?? undefined,
                };
            }
            catch (err) {
                console.error("Scoring failed for job:", job.id, err);
                return {
                    ...job,
                    scoringStatus: "failed",
                };
            }
        })));
        return results;
    }
    async scoreJob(job) {
        try {
            const prompt = buildPromptForJobScore(job, this.resume);
            const response = await client.chat.completions.create({
                model: "gpt-4o-mini",
                temperature: 0.2,
                messages: [{ role: "user", content: prompt }],
            });
            const message = response.choices?.[0]?.message;
            if (!message?.content)
                return null;
            const contentRaw = message.content;
            let content = null;
            if (typeof contentRaw === "string") {
                content = contentRaw;
            }
            else if (Array.isArray(contentRaw)) {
                content = contentRaw
                    .map((p) => ("text" in p ? p.text : ""))
                    .join("");
            }
            if (!content)
                return null;
            // 🔹 Safe JSON parsing
            const parsed = extractJSON(content);
            const result = JobScoreSchema.safeParse(parsed);
            if (!result.success) {
                console.error("Validation failed:", result.error);
                return null;
            }
            return result.data;
        }
        catch (err) {
            console.error("Error scoring job:", err);
            return null;
        }
    }
}
//# sourceMappingURL=OpenAIJobScorer.js.map