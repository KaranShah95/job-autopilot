import type { IJobSource } from './IJobSource.ts';
import type { Job } from '../domain/Job.ts';
import type { SearchCriteria } from '../domain/SearchCriteria.ts';
export declare class AdzunaService implements IJobSource {
    getJobsAsync(criteria: SearchCriteria): Promise<Job[]>;
    private buildUrl;
}
//# sourceMappingURL=AzunaService.d.ts.map