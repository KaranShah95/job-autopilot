import type { Job } from '../domain/Job.js';
import type {SearchCriteria} from '../domain/SearchCriteria.js';

export interface IJobSource
{
    sourceName: string;
    getJobsAsync(searchCriteria: SearchCriteria): Promise<Job[]>;
}