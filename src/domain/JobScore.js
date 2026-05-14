import { z } from "zod";
//JobScore DTO
/* export interface JobScore {
  
  score: number; // 0–100

  // Why it's a good match
  strengths: string[];

  // Gaps vs job requirements
  gaps: string[];

  // Key matched keywords (important for ATS-style tailoring)
  matchedKeywords: string[];

  // Missing keywords
  missingKeywords: string[];

  // Experience alignment
  experienceMatch?: {
    requiredYears?: number;
    candidateYears?: number;
    meetsRequirement: boolean;
  };

  // Role alignment
  roleFit?: "strong" | "moderate" | "weak";

  // Confidence in score (helps debugging/improving prompts)
  confidence?: number; // 0–1
} */
//Zod
export const JobScoreSchema = z.object({
    score: z.number().min(0).max(100),
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    matchedKeywords: z.array(z.string()),
    missingKeywords: z.array(z.string()),
    experienceMatch: z
        .object({
        requiredYears: z.number().optional(),
        candidateYears: z.number().optional(),
        meetsRequirement: z.boolean(),
    })
        .optional(),
    roleFit: z.enum(["strong", "moderate", "weak"]).optional(),
    confidence: z.number().min(0).max(1).optional(),
});
//# sourceMappingURL=JobScore.js.map