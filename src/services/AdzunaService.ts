import type { IJobSource } from './IJobSource.js';
import type { Job, CreateJobDTO, JobType, JobLocation } from '../domain/Job.js';
import { toJob } from '../domain/Job.js';
import type { SearchCriteria } from '../domain/SearchCriteria.js';
import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';

// --- Base URL per country ---
const BASE_URL_BY_COUNTRY: Record<string, string> = {
  US: 'https://api.adzuna.com/v1/api/jobs/us/search',  // United States
  GB: 'https://api.adzuna.com/v1/api/jobs/gb/search',  // United Kingdom
  DE: 'https://api.adzuna.com/v1/api/jobs/de/search',  // Germany
  FR: 'https://api.adzuna.com/v1/api/jobs/fr/search',  // France
  AU: 'https://api.adzuna.com/v1/api/jobs/au/search',  // Australia
  NZ: 'https://api.adzuna.com/v1/api/jobs/nz/search',  // New Zealand
  CA: 'https://api.adzuna.com/v1/api/jobs/ca/search',  // Canada
  IN: 'https://api.adzuna.com/v1/api/jobs/in/search',  // India
  PL: 'https://api.adzuna.com/v1/api/jobs/pl/search',  // Poland
  BR: 'https://api.adzuna.com/v1/api/jobs/br/search',  // Brazil
  AT: 'https://api.adzuna.com/v1/api/jobs/at/search',  // Austria
  ZA: 'https://api.adzuna.com/v1/api/jobs/za/search',  // South Africa
};

const DEFAULT_BASE_URL = 'https://api.adzuna.com/v1/api/jobs/us/search';

export class AdzunaService implements IJobSource {

  sourceName = "Adzuna";
  async getJobsAsync(criteria: SearchCriteria): Promise<Job[]> {
    console.log("[INFO] AdzunaService.getJobsAsync called");
    console.log("[INFO] Search criteria:", JSON.stringify(criteria, null, 2));

    try {
      // Build one URL per keyword per location combination
      const urls = this.buildUrls(criteria);
      console.log(`[INFO] Total URLs to fetch: ${urls.length}`);

      // Fetch all URLs in parallel
      const results = await Promise.all(
        urls.map(url => this.fetchJobsFromUrl(url))
      );

      // Flatten
      const allJobs = results.flat();

      console.log(`[INFO] Total jobs: ${allJobs.length}`);

      return allJobs;
    } catch (error) {
      console.error("[ERROR] Failed to fetch jobs from Adzuna:", error);
      throw error;
    }
  }

  // ============================================================
  // Private — URL building
  // ============================================================

  private buildUrls = (criteria: SearchCriteria): string[] => {
    const {
      keywords = [],
      locations = [],
      jobType,
      company,
      page = 1,
      pageSize = 20,
    } = criteria;

    const appId = process.env.ADZUNA_APP_ID;
    const apiKey = process.env.ADZUNA_API_KEY;

    if (!appId || !apiKey) {
      throw new Error("Missing Adzuna API credentials");
    }

    const urls: string[] = [];

    // If no keywords and no locations — build one default URL
    const keywordList = keywords.length ? keywords : [''];
    const locationList = locations.length ? locations : [undefined];

    for (const keyword of keywordList) {
      for (const location of locationList) {
        const baseUrl = this.getBaseUrl(location);
        const params = new URLSearchParams();

        // --- Auth ---
        params.append("app_id", appId);
        params.append("app_key", apiKey);

        // --- One keyword per URL ---
        if (keyword) {
          params.append("what", keyword);
          console.log(`[INFO] keyword: "${keyword}"`);
        }

        // --- Company ---
        if (company) {
          params.append("company", company);
        }

        // --- Pagination ---
        params.append("results_per_page", pageSize.toString());
        params.append("content-type", "application/json");

        const url = `${baseUrl}/${page}?${params.toString()}`;
        console.log(`[INFO] Built URL: ${url}`);
        urls.push(url);
      }
    }

    return urls;
  };

  private getBaseUrl = (location?: JobLocation): string => {
    if (!location?.country) return DEFAULT_BASE_URL;
    return BASE_URL_BY_COUNTRY[location.country.toUpperCase()] ?? DEFAULT_BASE_URL;
  };

  // ============================================================
  // Private — Fetching
  // ============================================================

  private fetchJobsFromUrl = async (url: string): Promise<Job[]> => {
    console.log(`[INFO] Fetching: ${url}`);

    const response = await fetch(url);
    console.log(`[INFO] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ERROR] Adzuna API error:", errorText);
      throw new Error(`Adzuna API error: ${response.status} ${response.statusText}`);
    }

    const raw = await response.json();
    const parsed = this.parseResponse(raw);

    console.log(`[INFO] Parsed ${parsed.results.length} jobs`);

    return parsed.results.map(job => toJob(mapAdzunaJob(job)));
  };

  private parseResponse = (raw: unknown) => {
    try {
      return AdzunaResponseSchema.parse(raw);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error("[ERROR] Zod validation failed. Total issues:", err.issues.length);
        err.issues.forEach((issue, index) => {
          console.error(`\n[ERROR] Issue #${index + 1}:`);
          console.error("  Path:    ", issue.path.join(" → "));
          console.error("  Message: ", issue.message);
          console.error("  Code:    ", issue.code);
          if (issue.code === z.ZodIssueCode.invalid_type) {
            console.error("  Expected:", issue.expected);
            //console.error("  Received:", issue.received);
          }
        });
        throw new Error("Adzuna response validation failed");
      }
      throw err;
    }
  };
}

// ============================================================
// Zod Schemas
// ============================================================

const AdzunaLocationSchema = z.object({
  display_name: z.string(),
  area: z.array(z.string()).optional(),
});

const AdzunaCategorySchema = z.object({
  label: z.string(),
  tag: z.string(),
});

const AdzunaCompanySchema = z.object({
  display_name: z.string(),
});

const AdzunaJobSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string(),
  description: z.string(),
  created: z.string(),
  redirect_url: z.string(),
  location: AdzunaLocationSchema,
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  company: AdzunaCompanySchema,
  category: AdzunaCategorySchema.optional(),
  contract_type: z.string().optional(),
  contract_time: z.string().optional(),
});

const AdzunaResponseSchema = z.object({
  results: z.array(AdzunaJobSchema),
});

type AdzunaJob = z.infer<typeof AdzunaJobSchema>;

// ============================================================
// Mapper
// ============================================================

const mapAdzunaJob = (raw: AdzunaJob): CreateJobDTO => ({
  sourceId: raw.id,
  source: 'adzuna',
  title: raw.title,
  description: raw.description,
  url: raw.redirect_url,
  company: { name: raw.company.display_name },
  location: {
      country: raw.location.area?.[0] ?? 'US',
      ...(raw.location.area?.[1] !== undefined && { state: raw.location.area[1] }),
      ...(raw.location.area?.[2] !== undefined && { city: raw.location.area[2] }),
  },
  jobType: mapJobType(raw.contract_time, raw.contract_type),
  skills: raw.category?.label ? [raw.category.label] : undefined,
  postedAt: new Date(raw.created),
});

const mapJobType = (
  contractTime?: string,
  contractType?: string
): JobType[] => {
  const types: JobType[] = [];
  if (contractTime === 'full_time') types.push('full-time');
  if (contractTime === 'part_time') types.push('part-time');
  if (contractType === 'contract')  types.push('contract');
  return types.length > 0 ? types : ['full-time'];
};
































/* import type {IJobSource} from './IJobSource.js';
import type {Job, CreateJobDTO, JobType, JobLocation} from '../domain/Job.js';
import {toJob} from '../domain/Job.js';
import type {SearchCriteria} from '../domain/SearchCriteria.js';
import dotenv from 'dotenv';
dotenv.config();
import { z } from 'zod';

const BASE_URL = "https://api.adzuna.com/v1/api/jobs/us/search";


export class AdzunaService implements IJobSource 
{
  async getJobsAsync(criteria: SearchCriteria): Promise<Job[]> {
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

        throw new Error(
          `Adzuna API error: ${response.status} ${response.statusText}`
        );
      }

      const raw = await response.json();
      console.log("[INFO] Raw response received from Adzuna");

      let parsed;
      try {
        parsed = AdzunaResponseSchema.parse(raw);
      } catch (err) {
        if (err instanceof z.ZodError) {
          console.error("[ERROR] Zod validation failed. Total issues:", err.issues.length);

          // Log each issue with full context
          err.issues.forEach((issue, index) => {
            console.error(`\n[ERROR] Issue #${index + 1}:`);
            console.error("  Path:     ", issue.path.join(" → "));
            console.error("  Message:  ", issue.message);
            console.error("  Code:     ", issue.code);

            // For type mismatches — show expected vs received
            if (issue.code === "invalid_type") {
              console.error("  Expected: ", issue.expected);
              //console.error("  Received: ", issue.received);
            }

            // Extract job index from path e.g. ["results", 3, "salary_is_predicted"]
            const jobIndex = issue.path[1];
            if (typeof jobIndex === "number" && raw.results?.[jobIndex]) {
              const failingJob = raw.results[jobIndex];
              console.error(`  Job #${jobIndex} title: "${failingJob?.title ?? "unknown"}"`);
              console.error(`  Job #${jobIndex} id:    "${failingJob?.id ?? "unknown"}"`);

              // Log the specific failing field's raw value
              const fieldName = issue.path[issue.path.length - 1];
              if (fieldName) {
                console.error(`  Raw value of "${String(fieldName)}": `, JSON.stringify(failingJob?.[fieldName]));
              }
            }
          });

          // Log the full raw response so you can inspect it
          console.error("\n[ERROR] Full raw Adzuna response:");
          console.error(JSON.stringify(raw, null, 2));

          throw new Error("Adzuna response validation failed");
        }
        throw err;
      }

      console.log(`[INFO] Parsed ${parsed.results.length} jobs from Adzuna`);

      const jobs = parsed.results.map(job => toJob(mapAdzunaJob(job)));

      console.log(`[INFO] Successfully mapped ${jobs.length} jobs`);

      return jobs;
    } catch (error) {
      console.error("[ERROR] Failed to fetch jobs from Adzuna:", error);
      throw error;
    }
  }

  // --- Private helpers ---

  private buildUrl = (criteria: SearchCriteria): string => {
    try {
      console.log("[INFO] Building Adzuna API URL...");

      const {
        keywords,
        company,
        locations,
        jobType,
        page = 1,
        pageSize = 20,
      } = criteria;

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

    // --- Keywords → what (only if explicitly provided, separate from titles) ---
    if (keywords?.length) {
      const whatQuery = keywords.map(k => `"${k}"`).join( "OR" );
      params.append("what", whatQuery);
      console.log("[INFO] what:", whatQuery);
    }

    // --- Location ---
    // Use location0/location1/location2 for structured location queries
    // location0 = country, location1 = state, location2 = city
     if (locations?.length) {
      const loc = locations[0];
      if (loc?.country) params.append("where", loc.country);
      if (loc?.state)   params.append("where", loc.state);
      if (loc?.city)    params.append("where", loc.city);
      console.log("[INFO] location:", loc);
    } else {
      // Default to US-wide
      params.append("location0", "US");
    }

    if (company !== undefined) {
        console.log("[INFO] company:", company);
        params.append("company", company);
    }

      // --- Job Type ---
      if (jobType?.length) {
        console.log("[INFO] Job types:", jobType);

        if (jobType.includes('full-time')) params.append("full_time", "1");
        if (jobType.includes('part-time')) params.append("part_time", "1");
        if (jobType.includes('contract')) params.append("contract", "1");
        if (jobType.includes('freelance')) params.append("freelance", "1");
        if (jobType.includes('internship')) params.append("internship", "1");
      }

      // --- Pagination ---
      //params.append("page", page.toString());
      params.append("results_per_page", pageSize.toString());

      const finalUrl = `${BASE_URL}/${page}?${params.toString()}`;

      console.log("[INFO] Built Adzuna URL successfully");

      return finalUrl;
    } catch (error) {
      console.error("[ERROR] Failed to build Adzuna URL:", error);
      throw error;
    }
  };
}

// --- Zod Schemas (based on real Adzuna API docs) ---

const AdzunaLocationSchema = z.object({
  display_name: z.string(),
  area: z.array(z.string()).optional(),  // e.g. ["US", "New York", "Manhattan"]
});

const AdzunaCategorySchema = z.object({
  label: z.string(),   // e.g. "IT Jobs"
  tag: z.string(),     // e.g. "it-jobs"
});

const AdzunaCompanySchema = z.object({
  display_name: z.string(),
});

const AdzunaJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  created: z.string(),             // ISO date string e.g. "2013-11-08T18:07:39Z"
  redirect_url: z.string(),

  // Location
  location: AdzunaLocationSchema,
  latitude: z.number().optional(),
  longitude: z.number().optional(),

  // Company & Category
  company: AdzunaCompanySchema,
  category: AdzunaCategorySchema.optional(),

  // Contract — TWO separate fields!
  contract_type: z.string().optional(),  // e.g. "permanent"
  contract_time: z.string().optional(),  // e.g. "full_time"
});

const AdzunaResponseSchema = z.object({
  results: z.array(AdzunaJobSchema),
});

type AdzunaJob = z.infer<typeof AdzunaJobSchema>;

const mapAdzunaJob = (raw: AdzunaJob): CreateJobDTO => ({
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
const mapJobType = (
  contractTime?: string,
  contractType?: string
): JobType[] => {
  const types: JobType[] = [];

  if (contractTime === 'full_time')  types.push('full-time');
  if (contractTime === 'part_time')  types.push('part-time');
  if (contractType === 'contract')   types.push('contract');

  // fallback if neither field is present
  return types.length > 0 ? types : ['full-time'];
}; */