import type {Job} from '../domain/Job.js';

export interface IProcessedJobsPersistenceManager {
    /**
     * Persists an array of jobs to the underlying storage.
     * @param jobs Array of Job objects to save.
     * @throws Promise rejection if saving fails.
     */
    saveJobIdsToPersistenceAsync(jobs: Job[]): Promise<void>;

    /**
     * Fetches previously persisted job Ids.
     */
    getJobIdsFromPersistenceAsync(): Promise<string[]>;
}