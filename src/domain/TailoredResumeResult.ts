import type { ResumeSection } from "./ResumeSection.js";
import type { Job } from "./Job.js";

/**
 * A fully traceable tailored resume output
 *
 * This preserves the entire job object so we can:
 * - re-score later
 * - re-tailor without refetching
 * - build analytics dashboards
 * - debug prompt quality issues
 */
export interface TailoredResumeResult {
  /**
   * Full original job object (source of truth)
   */
  job: Job;

  /**
   * Optional snapshot of score for quick ranking/filtering
   * (avoids needing to re-read job.relevanceScore every time)
   */
  jobScore?: number;

  /**
   * Final tailored resume output
   */
  resume: ResumeSection;

  /**
   * When this tailored resume was generated
   */
  createdAt: string;
}