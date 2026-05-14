import { toJob } from '../domain/Job.js';
import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';
const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search";
export class AdzunaService {
    async getJobsAsync(criteria) {
        console.log("[INFO] AdzunaService.getJobsAsync called");
        console.log("[INFO] Search criteria:", JSON.stringify(criteria, null, 2));
        try {
            const url = this.buildUrl(criteria);
            console.log(`[INFO] Fetching jobs from Adzuna API: ${url}`);
            const response = await fetch(url);
            console.log(`[INFO] Adzuna API response status: ${response.status}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error("[ERROR] Adzuna API error response:", errorText);
                throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
            }
            const raw = await response.json();
            console.log("[INFO] Raw response received from Adzuna");
            let parsed;
            try {
                parsed = AdzunaResponseSchema.parse(raw);
            }
            catch (err) {
                if (err instanceof z.ZodError) {
                    console.error("[ERROR] Zod validation failed for Adzuna response:");
                    console.error(err.format());
                    throw new Error("Adzuna response validation failed");
                }
                throw err;
            }
            console.log(`[INFO] Parsed ${parsed.results.length} jobs from Adzuna`);
            const jobs = parsed.results.map(job => toJob(mapAdzunaJob(job)));
            console.log(`[INFO] Successfully mapped ${jobs.length} jobs`);
            return jobs;
        }
        catch (error) {
            console.error("[ERROR] Failed to fetch jobs from Adzuna:", error);
            throw error;
        }
    }
    // --- Private helpers ---
    buildUrl = (criteria) => {
        try {
            console.log("[INFO] Building Adzuna API URL...");
            const { keywords, locations, salaryMin, salaryMax, jobType, page = 1, pageSize = 20, } = criteria;
            const appId = process.env.ADZUNA_APP_ID;
            const apiKey = process.env.ADZUNA_API_KEY;
            if (!appId || !apiKey) {
                console.error("[ERROR] Missing Adzuna API credentials");
                throw new Error("Missing Adzuna API credentials");
            }
            const params = new URLSearchParams();
            // --- Auth ---
            params.append("app_id", appId);
            params.append("app_key", apiKey);
            // --- Keywords ---
            if (keywords?.length) {
                const keywordStr = keywords.join(" ");
                console.log("[INFO] Keywords:", keywordStr);
                params.append("what", keywordStr);
            }
            // --- Location ---
            if (locations?.length) {
                const loc = locations[0];
                const parts = [
                    loc?.city,
                    loc?.state,
                    loc?.country,
                ].filter(Boolean);
                const where = parts.join(", ");
                console.log("[INFO] Location:", where);
                params.append("where", where);
            }
            // --- Salary ---
            if (salaryMin !== undefined) {
                console.log("[INFO] salaryMin:", salaryMin);
                params.append("salary_min", salaryMin.toString());
            }
            if (salaryMax !== undefined) {
                console.log("[INFO] salaryMax:", salaryMax);
                params.append("salary_max", salaryMax.toString());
            }
            // --- Job Type ---
            if (jobType?.length) {
                console.log("[INFO] Job types:", jobType);
                if (jobType.includes('full-time'))
                    params.append("full_time", "1");
                if (jobType.includes('part-time'))
                    params.append("part_time", "1");
                if (jobType.includes('contract'))
                    params.append("contract", "1");
                if (jobType.includes('freelance'))
                    params.append("freelance", "1");
                if (jobType.includes('internship'))
                    params.append("internship", "1");
            }
            // --- Pagination ---
            params.append("page", page.toString());
            params.append("results_per_page", pageSize.toString());
            const finalUrl = `${BASE_URL}/${page}?${params.toString()}`;
            console.log("[INFO] Built Adzuna URL successfully");
            return finalUrl;
        }
        catch (error) {
            console.error("[ERROR] Failed to build Adzuna URL:", error);
            throw error;
        }
    };
}
// --- Zod Schemas (based on real Adzuna API docs) ---
const AdzunaLocationSchema = z.object({
    display_name: z.string(),
    area: z.array(z.string()).optional(), // e.g. ["US", "New York", "Manhattan"]
});
const AdzunaCategorySchema = z.object({
    label: z.string(), // e.g. "IT Jobs"
    tag: z.string(), // e.g. "it-jobs"
});
const AdzunaCompanySchema = z.object({
    display_name: z.string(),
});
const AdzunaJobSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    created: z.string(), // ISO date string e.g. "2013-11-08T18:07:39Z"
    redirect_url: z.string(),
    // Salary
    salary_min: z.number().optional(),
    salary_max: z.number().optional(),
    salary_is_predicted: z.number(), // 0 = real, 1 = predicted
    // Location
    location: AdzunaLocationSchema,
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    // Company & Category
    company: AdzunaCompanySchema,
    category: AdzunaCategorySchema.optional(),
    // Contract — TWO separate fields!
    contract_type: z.string().optional(), // e.g. "permanent"
    contract_time: z.string().optional(), // e.g. "full_time"
});
const AdzunaResponseSchema = z.object({
    results: z.array(AdzunaJobSchema),
});
const mapAdzunaJob = (raw) => ({
    // --- Identity ---
    sourceId: raw.id,
    source: 'adzuna',
    // --- Basic Info ---
    title: raw.title,
    description: raw.description,
    url: raw.redirect_url,
    // --- Company ---
    company: {
        name: raw.company.display_name,
    },
    // --- Location ---
    // area[] = ["UK", "South East England", "Buckinghamshire", "Marlow"]
    //           [0]         [1]                    [2]            [3]
    location: {
        country: raw.location.area?.[0] ?? 'US',
        state: raw.location.area?.[1],
        city: raw.location.area?.[2] ?? raw.location.area?.[3],
    },
    // --- Salary ---
    salary: raw.salary_min || raw.salary_max
        ? {
            // Adzuna doesn't return currency — defaulting to USD
            // because we are querying the /jobs/us/ endpoint
            currency: 'USD',
            // Adzuna doesn't return period — defaulting to yearly
            // because salary values like 50000-55000 are annual figures
            period: 'yearly',
            ...(raw.salary_min !== undefined && { min: raw.salary_min }),
            ...(raw.salary_max !== undefined && { max: raw.salary_max }),
        }
        : undefined,
    // --- Job Type ---
    // contract_time = full_time | part_time
    // contract_type = permanent | contract
    jobType: mapJobType(raw.contract_time, raw.contract_type),
    // --- Category as skills hint ---
    skills: raw.category?.label ? [raw.category.label] : undefined,
    // --- Dates ---
    postedAt: new Date(raw.created),
});
// --- Helper: map Adzuna contract fields → our JobType ---
const mapJobType = (contractTime, contractType) => {
    const types = [];
    if (contractTime === 'full_time')
        types.push('full-time');
    if (contractTime === 'part_time')
        types.push('part-time');
    if (contractType === 'contract')
        types.push('contract');
    // fallback if neither field is present
    return types.length > 0 ? types : ['full-time'];
};
//# sourceMappingURL=AdzunaService.js.map