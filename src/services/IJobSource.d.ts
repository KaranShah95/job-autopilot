import type { Job } from '../domain/Job.js';
import type { SearchCriteria } from '../domain/SearchCriteria.js';
export interface IJobSource {
    getJobsAsync(searchCriteria: SearchCriteria): Promise<Job[]>;
}
//# sourceMappingURL=IJobSource.d.ts.map