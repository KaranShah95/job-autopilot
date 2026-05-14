// domain/SearchCriteria.ts

import type { ExperienceLevel, JobType, WorkMode, JobLocation } from '../domain/Job.js';
import { z } from "zod";

export interface SearchCriteria {
  // Core
  keywords?: string[];                  // e.g. ['TypeScript', 'Node.js']
  locations?: JobLocation[];                   // e.g. 'New York' or 'United States'
  company?: string;                     //Single Canonical company name e.g. Microsoft
  isVisaSponsorshipRequired?: boolean;

  // Role filters
  experienceLevel?: ExperienceLevel[];
  jobType?: JobType[];
  workMode?: WorkMode[];

  // Pagination
  page?: number;
  pageSize?: number;
}

// For JobType and WorkMode, just use arrays of strings
const jobTypes: JobType[] = ["full-time", "part-time", "contract", "freelance", "internship"];
const workModes: WorkMode[] = ["remote", "onsite", "hybrid"];

// Zod schema for ExperienceLevel
const ExperienceLevelSchema = z.object({
  level: z.enum(["internship", "entry", "mid", "senior", "lead", "executive"]),
  minYears: z.number().optional(),
  maxYears: z.number().optional(),
});

// Zod schema for JobLocation
const JobLocationSchema = z.object({   
  //For Country use the acronymes instead of full country names: 
  //US: United States
  //GB: United Kingdom
  //DE: Germany
  //FR: France
  //AU: Australia
  //NZ: New Zealand
  //CA: Canada
  //IN: India
  //PL: Poland
  //BR: Brazil
  //AT: Austria
  //ZA: South Africa
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
});

// Complete SearchCriteria schema
export const SearchCriteriaSchema = z.object({
  keywords: z.array(z.string()).optional(),
  company: z.string().optional(),
  locations: z.array(JobLocationSchema).optional(),
  experienceLevel: z.array(ExperienceLevelSchema).optional(),
  jobType: z.array(z.enum(jobTypes)).optional(),
  workMode: z.array(z.enum(workModes)).optional(),
  isVisaSponsorshipRequired: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});

export type SearchCriteriaZ = z.infer<typeof SearchCriteriaSchema>;