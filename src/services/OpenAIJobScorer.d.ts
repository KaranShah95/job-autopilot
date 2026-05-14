import type { Job } from "../domain/Job.js";
import type { JobScore } from "../domain/JobScore.js";
import type { IScoreJobs } from "./IScoreJobs.js";
export declare class OpenAIJobScorer implements IScoreJobs {
    private readonly resume;
    constructor(resume: string);
    ScoreJobsAsync(jobs: Job[]): Promise<Job[]>;
    scoreJob(job: Job): Promise<JobScore | null>;
}
//# sourceMappingURL=OpenAIJobScorer.d.ts.map