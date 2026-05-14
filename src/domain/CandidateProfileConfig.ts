import { SearchCriteriaSchema } from "../domain/SearchCriteria.js";
import type { TailoredResumeResult } from "./TailoredResumeResult.js";
import { z } from "zod";

export const CandidateProfileConfigSchema = z.object({
  candidateId: z.string(),
  isSoftwareEngineer: z.boolean(),
  resumeFilePath: z.string(),
  jobSearchCriteria: SearchCriteriaSchema,  // reuse schema for SearchCriteria
  resumeText: z.string().optional(),
});

export type CandidateProfileConfig = z.infer<typeof CandidateProfileConfigSchema>;