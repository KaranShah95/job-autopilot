import { z } from "zod";
export type JobScore = z.infer<typeof JobScoreSchema>;
export declare const JobScoreSchema: z.ZodObject<{
    score: z.ZodNumber;
    strengths: z.ZodArray<z.ZodString>;
    gaps: z.ZodArray<z.ZodString>;
    matchedKeywords: z.ZodArray<z.ZodString>;
    missingKeywords: z.ZodArray<z.ZodString>;
    experienceMatch: z.ZodOptional<z.ZodObject<{
        requiredYears: z.ZodOptional<z.ZodNumber>;
        candidateYears: z.ZodOptional<z.ZodNumber>;
        meetsRequirement: z.ZodBoolean;
    }, z.core.$strip>>;
    roleFit: z.ZodOptional<z.ZodEnum<{
        strong: "strong";
        moderate: "moderate";
        weak: "weak";
    }>>;
    confidence: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=JobScore.d.ts.map