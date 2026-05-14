import type { IJobSource } from './IJobSource.js';
import type { Job } from '../domain/Job.js';
import type { SearchCriteria } from '../domain/SearchCriteria.js';
export declare class AdzunaService implements IJobSource {
    getJobsAsync(criteria: SearchCriteria): Promise<Job[]>;
    private buildUrl;
}
//# sourceMappingURL=AdzunaService.d.ts.map