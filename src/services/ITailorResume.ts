import type { CandidateProfileConfig } from '../domain/CandidateProfileConfig.js';
import type {Job} from '../domain/Job.js';
import type { TailoredResumeResult } from '../domain/TailoredResumeResult.js';

export interface ITailorResume
{
    sourceName: string;
    tailorResumeAsync(jobs: Job, candidateProfileConfig: CandidateProfileConfig): Promise<TailoredResumeResult>;
}