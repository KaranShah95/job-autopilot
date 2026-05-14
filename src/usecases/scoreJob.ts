import type { IScoreJob } from "../services/IScoreJob.js";
import type { Job } from "../domain/Job.js";
import type { CandidateProfileConfig } from "../domain/CandidateProfileConfig.js";

export const scoreJob = async (
  jobScorer: IScoreJob,
  job: Job,
  candidateConfig: CandidateProfileConfig
): Promise<Job> => {
  try {
    
    console.log('[INFO] Input job objects:', job);
    console.log(`[INFO] Scoring job ${job.id} using ${jobScorer.sourceName}...`);

    const scoredJob = await jobScorer.scoreJobAsync(job, candidateConfig);

    console.log(`[INFO] Scored job ${scoredJob.id} with score ${scoredJob.relevanceScore?.score} using ${jobScorer.sourceName}`);

    return scoredJob;
  } catch (error) {
    console.error(`[ERROR] Failed to score job ${job.id} using ${jobScorer.sourceName}:`, error);
    throw error;
  }
};