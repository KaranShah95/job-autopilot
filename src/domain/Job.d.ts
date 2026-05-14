import type { JobScore } from './JobScore.js';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
export type WorkMode = 'remote' | 'onsite' | 'hybrid';
export type ScoringStatus = 'pending' | 'scored' | 'failed';
export interface ExperienceLevel {
    level: 'internship' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
    minYears?: number;
    maxYears?: number;
}
export interface Salary {
    min?: number;
    max?: number;
    currency: string;
    period: 'hourly' | 'monthly' | 'yearly';
}
export interface Company {
    name: string;
    logoUrl?: string;
    website?: string;
    size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
    industry?: string;
}
export interface JobLocation {
    country: string;
    state?: string;
    city?: string;
}
export interface Job {
    id: string;
    sourceId: string;
    source: string;
    title: string;
    description: string;
    url: string;
    company: Company;
    experienceLevel?: ExperienceLevel[];
    jobType?: JobType[];
    workMode?: WorkMode[];
    salary?: Salary;
    location?: JobLocation;
    skills?: string[];
    postedAt: Date;
    expiresAt?: Date;
    fetchedAt: Date;
    scoringStatus: ScoringStatus;
    relevanceScore?: JobScore;
}
export interface CreateJobDTO {
    sourceId: string;
    source: string;
    title: string;
    description: string;
    url: string;
    company: Company;
    experienceLevel?: ExperienceLevel[];
    jobType?: JobType[];
    workMode?: WorkMode[];
    salary?: Salary;
    location?: JobLocation;
    skills?: string[];
    postedAt: Date;
    expiresAt?: Date;
}
export type JobResponseDTO = Omit<Job, 'sourceId'> & {
    postedAt: string;
    fetchedAt: string;
};
export declare const toJob: (dto: CreateJobDTO) => Job;
//# sourceMappingURL=Job.d.ts.map