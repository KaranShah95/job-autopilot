import { SearchCriteriaSchema } from "../domain/SearchCriteria.js"; // assuming you already have it
import { z } from "zod";
export const CandidatePreferencesSchema = z.object({
    remoteOnly: z.boolean().optional(),
    maxCommuteMinutes: z.number().optional(),
    requireVisaSponsorship: z.boolean().optional(),
});
export const CandidateProfileConfigSchema = z.object({
    candidateId: z.string(),
    resumeFilePath: z.string(),
    jobSearchCriteria: SearchCriteriaSchema, // reuse schema for SearchCriteria
    preferences: CandidatePreferencesSchema.optional(),
});
//# sourceMappingURL=CandidateProfileConfig.js.map