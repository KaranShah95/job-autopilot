import type { IJobSource } from "../services/IJobSource.js";
import type { Job } from "../domain/Job.js";
import type { SearchCriteria } from "../domain/SearchCriteria.js";

export const fetchJobs = async (
  jobSource: IJobSource,
  criteria: SearchCriteria
): Promise<Job[]> => {
  try {
    console.log(`[INFO] Fetching jobs from ${jobSource.sourceName}...`);

    const jobs = await jobSource.getJobsAsync(criteria);

    console.log(`[INFO] Retrieved ${jobs.length} jobs from ${jobSource.sourceName}`);

    return jobs;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch jobs from ${jobSource.sourceName}:`, error);
    throw error;
  }
};