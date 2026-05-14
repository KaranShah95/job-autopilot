// domain/Job.ts

import { randomUUID } from 'crypto';
import type { JobScore } from './JobScore.js';

// ============================================================
// Primitives
// ============================================================

export type JobType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'freelance'
  | 'internship';

export type WorkMode = 'remote' | 'onsite' | 'hybrid';

export type ScoringStatus = 'pending' | 'scored' | 'failed';

// ============================================================
// Sub-interfaces
// ============================================================

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
  country?: string;
  state?: string;
  city?: string;
}

// ============================================================
// Core Job
// ============================================================

export interface Job {
  // Identity
  id: string;
  sourceId: string;
  source: string;

  // Basic Info
  title: string;
  description: string;
  url: string;

  // Company
  company: Company;

  // Role Details
  experienceLevel?: ExperienceLevel[];
  jobType?: JobType[];
  workMode?: WorkMode[];
  salary?: Salary;
  location?: JobLocation;
  skills?: string[];

  // Metadata
  postedAt: Date;
  expiresAt?: Date;
  fetchedAt: Date;

  // Scoring
  scoringStatus: ScoringStatus;
  relevanceScore?: JobScore;          // only present when scoringStatus === 'scored'
}

// ============================================================
// Derived DTOs
// ============================================================

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

export const toJob = (dto: CreateJobDTO): Job => ({
  id: dto.source + dto.sourceId,
  fetchedAt: new Date(),
  scoringStatus: 'pending',
  ...dto,
});