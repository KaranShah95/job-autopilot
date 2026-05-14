import type { Job } from '../domain/Job.ts';
export interface IScoreJobs {
    ScoreJobsAsync(jobs: Job[]): Promise<Job[]>;
}
//# sourceMappingURL=IScoreJobs.d.ts.map