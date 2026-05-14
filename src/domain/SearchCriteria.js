// domain/SearchCriteria.ts
import { z } from "zod";
// For JobType and WorkMode, just use arrays of strings
const jobTypes = ["full-time", "part-time", "contract", "freelance", "internship"];
const workModes = ["remote", "onsite", "hybrid"];
// Zod schema for ExperienceLevel
const ExperienceLevelSchema = z.object({
    level: z.enum(["internship", "entry", "mid", "senior", "lead", "executive"]),
    minYears: z.number().optional(),
    maxYears: z.number().optional(),
});
// Zod schema for JobLocation
const JobLocationSchema = z.object({
    country: z.string(),
    state: z.string().optional(),
    city: z.string().optional(),
});
// Complete SearchCriteria schema
export const SearchCriteriaSchema = z.object({
    keywords: z.array(z.string()).min(1, "At least one keyword is required"),
    locations: z.array(JobLocationSchema).min(1, "At least one location is required"),
    experienceLevel: z.array(ExperienceLevelSchema).optional(),
    jobType: z.array(z.enum(jobTypes)).optional(),
    workMode: z.array(z.enum(workModes)).optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    page: z.number().int().min(1).optional(),
    pageSize: z.number().int().min(1).max(100).optional(),
});
//# sourceMappingURL=SearchCriteria.js.map