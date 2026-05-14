import { z } from "zod";

export type JobScore = z.infer<typeof JobScoreSchema>;

export const JobContextSchema = z.object({
  // -------------------------
  // CORE CLASSIFICATION
  // -------------------------
  domain: z.string(),

  seniorityLevel: z.enum([
    "junior",
    "mid",
    "senior",
    "staff",
    "principal"
  ]),

  systemComplexity: z.enum([
    "simple application",
    "multi-tier application",
    "distributed system",
    "enterprise distributed platform",
    "mission-critical platform"
  ]),

  // -------------------------
  // SYSTEM ARCHITECTURE MODEL (NEW)
  // -------------------------
  systemArchitecture: z.object({
    backend: z.array(z.string()),
    frontend: z.array(z.string()),
    data: z.array(z.string()),
    cloud: z.array(z.string()),
    integration: z.array(z.string()),
    devops: z.array(z.string()).optional(),
  }),

  // -------------------------
  // SIGNAL TAXONOMY (NEW)
  // -------------------------
  engineeringSignals: z.object({
    systemCharacteristics: z.array(z.string()),
    architecturalPatterns: z.array(z.string()),
    runtimeConstraints: z.array(z.string()),
    operationalConcerns: z.array(z.string()),
  }),

  // -------------------------
  // BUSINESS CONTEXT
  // -------------------------
  businessPriorities: z.array(z.string()),

  // -------------------------
  // NORMALIZED RESPONSIBILITIES
  // -------------------------
  coreResponsibilities: z.object({
    systemDesign: z.array(z.string()),
    backendDevelopment: z.array(z.string()),
    frontendIntegration: z.array(z.string()),
    cloudArchitecture: z.array(z.string()),
    dataSystems: z.array(z.string()),
    devopsDelivery: z.array(z.string()),
    leadershipOwnership: z.array(z.string()),
  }),

  // -------------------------
  // WHAT THE JOB IS REALLY SOLVING
  // -------------------------
  inferredChallenges: z.array(z.string()),

  // -------------------------
  // 🚨 NEW: RESUME SHAPING ENGINE
  // -------------------------
  resumeShapingDirectives: z.object({
    emphasize: z.array(z.string()),
    deEmphasize: z.array(z.string()),
    narrativeFocus: z.array(z.string()),
    seniorityBias: z.enum([
      "backend-heavy",
      "balanced",
      "frontend-heavy"
    ]),
  }),

  // -------------------------
  // IMPORTANCE WEIGHTS (NEW)
  // -------------------------
  componentImportance: z.object({
    backend: z.number().min(0).max(5),
    frontend: z.number().min(0).max(5),
    data: z.number().min(0).max(5),
    cloud: z.number().min(0).max(5),
    integration: z.number().min(0).max(5),
  }),
});

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

  roleDomain: z.enum(["software engineering", "financial analysis", "business analysis" , "data analysis", "tax analysis"]),

  jobContext: JobContextSchema.optional(),
});