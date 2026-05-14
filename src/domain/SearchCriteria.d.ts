import type { ExperienceLevel, JobType, WorkMode, JobLocation } from '../domain/Job.js';
import { z } from "zod";
export interface SearchCriteria {
    keywords: string[];
    locations: JobLocation[];
    experienceLevel?: ExperienceLevel[];
    jobType?: JobType[];
    workMode?: WorkMode[];
    salaryMin?: number;
    salaryMax?: number;
    page?: number;
    pageSize?: number;
}
export declare const SearchCriteriaSchema: z.ZodObject<{
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
export type SearchCriteriaZ = z.infer<typeof SearchCriteriaSchema>;
//# sourceMappingURL=SearchCriteria.d.ts.map