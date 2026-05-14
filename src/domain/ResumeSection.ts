import { z } from "zod";

// ============================================================
// Contact Info
// ============================================================

const CandidateContactSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),          // e.g. "San Diego, CA"
  linkedin: z.string().optional(),          // URL or handle
  github: z.string().optional(),            // URL or handle
  portfolio: z.string().optional(),         // personal website
});

// ============================================================
// Education
// ============================================================

export const ResumeEducationSchema = z.object({
  degree: z.string(),                       // e.g. "B.S. Computer Science"
  institution: z.string(),                  // e.g. "UC San Diego"
  year: z.string(),                         // e.g. "2023" or "2020 – 2024"
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  gpa: z.string().optional(),
  honors: z.string().optional(),            // e.g. "Magna Cum Laude"
  relevantCoursework: z.array(z.string()).optional(),
});

// ============================================================
// Skills
// ============================================================

const ResumeSkillCategorySchema = z.object({
  category: z.string().optional(),              // e.g. "Programming Languages"
  skills: z.array(z.string()),       // e.g. ["C#", ".NET Core", "Python"]
});

export const ResumeSkillsSchema = z.object({
  title: z.string().optional(),      // e.g. "Technical Skills"
  categories: z.array(ResumeSkillCategorySchema),
});

// ============================================================
// Experience
// ============================================================

export const ResumeExperienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),          // e.g. "San Francisco, CA" or "Remote"
  duration: z.string(),                     // e.g. "Jan 2022 – Present"
  bullets: z.array(z.string()),
});

// ============================================================
// Projects
// ============================================================

export const ResumeProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  company: z.string().optional(),
  duration: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  bullets: z.array(z.string()).optional(),
  url: z.string().optional(),
});

// ============================================================
// Volunteer / Extracurricular
// ============================================================

const ResumeVolunteerSchema = z.object({
  role: z.string(),                         // e.g. "Volunteer Tutor"
  organization: z.string(),                 // e.g. "Code for America"
  duration: z.string().optional(),
  bullets: z.array(z.string()).optional(),
});

// ============================================================
// Publication / Research
// ============================================================

const ResumePublicationSchema = z.object({
  title: z.string(),
  publisher: z.string().optional(),         // e.g. journal or conference name
  year: z.string().optional(),
  url: z.string().optional(),
  description: z.string().optional(),
});

// ============================================================
// Award
// ============================================================

const ResumeAwardSchema = z.object({
  title: z.string(),                        // e.g. "Dean's List"
  issuer: z.string().optional(),            // e.g. "UC San Diego"
  year: z.string().optional(),
  description: z.string().optional(),
});

// ============================================================
// Language
// ============================================================

const ResumeLangaugeSchema = z.object({
  language: z.string(),                     // e.g. "Spanish"
  proficiency: z.string().optional(),       // e.g. "Fluent", "Native", "Conversational"
});

// ============================================================
// Core ResumeSection
// ============================================================

export const ResumeSectionSchema = z.object({
  // Personal Info
  contact: CandidateContactSchema.optional(),

  // Core sections
  summary: z.string().optional(),
  keyAchievements: z.array(z.string()).optional(),
  experience: z.array(ResumeExperienceSchema).optional(),
  projects: z.array(ResumeProjectSchema).optional(),
  education: z.array(ResumeEducationSchema).optional(),

  // Skills
  skills: ResumeSkillsSchema.optional(),
  languages: z.array(ResumeLangaugeSchema).optional(),

  // Additional sections
  certifications: z.array(z.string()).optional(),
  volunteer: z.array(ResumeVolunteerSchema).optional(),
  publications: z.array(ResumePublicationSchema).optional(),
  awards: z.array(ResumeAwardSchema).optional(),
});

// ============================================================
// Inferred Types
// ============================================================

export type CandidateContact    = z.infer<typeof CandidateContactSchema>;
export type ResumeEducation     = z.infer<typeof ResumeEducationSchema>;
export type ResumeSkillCategory = z.infer<typeof ResumeSkillCategorySchema>;
export type ResumeSkills        = z.infer<typeof ResumeSkillsSchema>;
export type ResumeExperience    = z.infer<typeof ResumeExperienceSchema>;
export type ResumeProject       = z.infer<typeof ResumeProjectSchema>;
export type ResumeVolunteer     = z.infer<typeof ResumeVolunteerSchema>;
export type ResumePublication   = z.infer<typeof ResumePublicationSchema>;
export type ResumeAward         = z.infer<typeof ResumeAwardSchema>;
export type ResumeLanguage      = z.infer<typeof ResumeLangaugeSchema>;
export type ResumeSection       = z.infer<typeof ResumeSectionSchema>;
