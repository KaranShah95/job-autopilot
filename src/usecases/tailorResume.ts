import type { ITailorResume } from "../services/ITailorResume.js";
import type { Job } from "../domain/Job.js";
import type { CandidateProfileConfig } from "../domain/CandidateProfileConfig.js";
import type { TailoredResumeResult } from "../domain/TailoredResumeResult.js";

export const tailorResume = async (
  tailoringSource: ITailorResume,
  job: Job,
  candidateProfileConfig: CandidateProfileConfig
): Promise<TailoredResumeResult> => {
  try {
    console.log(`[INFO] Tailoring Resume for job ${job.id} using ${tailoringSource.sourceName}...`);

    const tailoredResume = await tailoringSource.tailorResumeAsync(job, candidateProfileConfig);
    
    console.log(`[INFO] Tailored Resume for job ${job.id} using ${tailoringSource.sourceName}`);

    return tailoredResume;
  } catch (error) {
    console.error(`[ERROR] Failed to tailor resume for job ${job.id} using ${tailoringSource.sourceName}:`, error);
    throw error;
  }
};