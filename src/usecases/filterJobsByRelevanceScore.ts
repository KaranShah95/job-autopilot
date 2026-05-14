import type { Job } from "../domain/Job.js";

/**
 * Filters jobs based on a minimum relevance score.
 *
 * @param jobs Jobs fetched in the current run
 * @param minScore Minimum relevance score threshold
 * @returns Array of jobs that meet the relevance criteria
 */
export function filterJobsByRelevanceScore(
  jobs: Job[],
  minScore: number
): Job[] {
  return jobs.filter(
    (job) =>
      job.relevanceScore &&
      job.scoringStatus === "scored" &&
      typeof job.relevanceScore.score === "number" &&
      job.relevanceScore.score >= minScore
  );
}