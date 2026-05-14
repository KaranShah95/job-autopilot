import type { CandidateProfileConfig } from "../domain/CandidateProfileConfig.js";
import type { Job } from "../domain/Job.js";
import { ResumeManager } from "../services/ResumeManager.js";
import type { IProcessedJobsPersistenceManager } from "../repositories/IProcessedJobsPersistenceManager.js";
import {FileSystemProcessedJobsPersistenceManager} from "../repositories/FileSystemProcessedJobsPersistenceManager.js"
import { OpenAIJobScorer } from "../services/OpenAIJobScorer.js";
import { scoreJob } from "./scoreJob.js";
import { tailorResume } from "./tailorResume.js";
import { OpenAIResumeTailor } from "../services/OpenAIResumeTailor.js";
import { saveTailoredResume } from "../usecases/saveTailoredResume.js";
import {filterJobsByRelevanceScore} from "../usecases/filterJobsByRelevanceScore.js";
import type { IScoreJob } from "../services/IScoreJob.js";
import type { ITailorResume } from "../services/ITailorResume.js";
import type { appConfig } from "../domain/appConfig.js";
import pLimit from "p-limit";

export async function processJobsAsync(
  jobs: Job[],
  candidateConfig: CandidateProfileConfig,
  concurrency: number,
  jobScorer: IScoreJob,
  resumeTailor: ITailorResume,
  resumeManager: ResumeManager,
  persistenceManager: IProcessedJobsPersistenceManager,
  appConfig: appConfig
): Promise<void> {
  const limit = pLimit(concurrency);
  const minScore = 80;

  const results = await Promise.all(
  jobs.map(job =>
    limit(async () => {
      try {
        // 1. Score
        // const scoredJob = await scoreJob(jobScorer, job, candidateConfig);

        // if (scoredJob.scoringStatus !== "scored") {
        //   console.log(`⏭️ Skipped "${job.title}" (not scored)`);
        //   return { status: "skipped", job };
        // }

        // if (scoredJob.relevanceScore && scoredJob.relevanceScore.score < minScore) {
        //   console.log(
        //     `⏭️ Skipped "${job.title}" (score: ${scoredJob.relevanceScore.score} < ${minScore})`
        //   );
        //   return { status: "skipped", job };
        // }

        // 2. Tailor
        const tailoredResume = await tailorResume(resumeTailor, job, candidateConfig);

        // 3. Save
        const savedPaths = await saveTailoredResume(
          resumeManager,
          tailoredResume,
          appConfig.tailoredResumeOutputDirectory
        );

        console.log(
          `✅ "${job.title}" → JSON: ${savedPaths.jsonPath}, DOCX: ${savedPaths.docxPath}`
        );

        // 4. Persist ID immediately (per job)
        await persistenceManager.saveJobIdsToPersistenceAsync([job]);

        return { status: "fulfilled", job: job };

      } catch (error) {
        console.error(`❌ Failed processing "${job.title}":`, error);
        return { status: "rejected", job, error };
      }
    })
  )
);

  // Summary
  const successes = results.filter(r => r.status === "fulfilled");
  const failures = results.filter(r => r.status === "rejected");
  const skipped = results.filter(r => r.status === "skipped");

  console.log(`\n🎯 Processing complete`);
  console.log(`✅ Successful: ${successes.length}`);
  console.log(`⏭️ Skipped: ${skipped.length}`);
  console.log(`❌ Failed: ${failures.length}`);
}