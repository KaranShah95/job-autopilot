import type { CandidateProfileConfig } from '../domain/CandidateProfileConfig.js';
import type {Job} from '../domain/Job.js';

export interface IScoreJob
{
    sourceName: string;
    scoreJobAsync(jobs: Job, candidateProfileConfig: CandidateProfileConfig): Promise<Job>;
}