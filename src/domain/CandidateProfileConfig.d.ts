import { z } from "zod";
export declare const CandidatePreferencesSchema: z.ZodObject<{
    remoteOnly: z.ZodOptional<z.ZodBoolean>;
    maxCommuteMinutes: z.ZodOptional<z.ZodNumber>;
    requireVisaSponsorship: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const CandidateProfileConfigSchema: z.ZodObject<{
    candidateId: z.ZodString;
    resumeFilePath: z.ZodString;
    jobSearchCriteria: z.ZodObject<{
        keywords: z.ZodArray<z.ZodString>;
        locations: z.ZodArray<z.ZodObject<{
            country: z.ZodString;
            state: z.ZodOptional<z.ZodString>;
            city: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        experienceLevel: z.ZodOptional<z.ZodArray<z.ZodObject<{
            level: z.ZodEnum<{
                internship: "internship";
                entry: "entry";
                mid: "mid";
                senior: "senior";
                lead: "lead";
                executive: "executive";
            }>;
            minYears: z.ZodOptional<z.ZodNumber>;
            maxYears: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>>>;
        jobType: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            "full-time": "full-time";
            "part-time": "part-time";
            contract: "contract";
            freelance: "freelance";
            internship: "internship";
        }>>>;
        workMode: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            remote: "remote";
            onsite: "onsite";
            hybrid: "hybrid";
        }>>>;
        salaryMin: z.ZodOptional<z.ZodNumber>;
        salaryMax: z.ZodOptional<z.ZodNumber>;
        page: z.ZodOptional<z.ZodNumber>;
        pageSize: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    preferences: z.ZodOptional<z.ZodObject<{
        remoteOnly: z.ZodOptional<z.ZodBoolean>;
        maxCommuteMinutes: z.ZodOptional<z.ZodNumber>;
        requireVisaSponsorship: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CandidateProfileConfig = z.infer<typeof CandidateProfileConfigSchema>;
//# sourceMappingURL=CandidateProfileConfig.d.ts.map