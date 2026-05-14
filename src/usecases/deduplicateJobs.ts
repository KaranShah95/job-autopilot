import type { Job } from "../domain/Job.js";

/**
 * Deduplicates new jobs against already persisted job IDs.
 *
 * @param newJobs Jobs fetched in the current run
 * @param persistedJobIds Job IDs already saved in persistence
 * @returns Array of jobs that are deduplicated
 */
export function deduplicateJobs(
  newJobs: Job[],
  persistedJobIds: string[]
): Job[] {
  const persistedIdsSet = new Set(persistedJobIds);

  return newJobs.filter((job) => !persistedIdsSet.has(job.id));
}