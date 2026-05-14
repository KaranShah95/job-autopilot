import type {Job} from '../domain/Job.js'; 
import type { CandidateProfileConfig } from './CandidateProfileConfig.js';

export function buildPromptForJobScore(
  job: Job,
  candidateProfileConfig: CandidateProfileConfig
): string {

   if (candidateProfileConfig.isSoftwareEngineer)
   {
      return buildPromptForSoftwareEngineerJobScore(job, candidateProfileConfig);
   }
   return buildPromptForGenericJobScore(job, candidateProfileConfig);
}

//New prompt with multi-dimentsional JobContext 
export function buildPromptForSoftwareEngineerJobScore(
  job: Job,
  candidateProfileConfig: CandidateProfileConfig
): string {
  return `
ROLE:
You are a Staff-level AI Talent Intelligence System.

Your job is NOT to summarize the job.

Your job is to convert the job into a:

🚨 "RESUME CONSTRUCTION BLUEPRINT"

This blueprint will be consumed by another system to generate a senior-level engineering resume.

---

CANDIDATE RESUME:
${candidateProfileConfig.resumeText}

---

JOB DESCRIPTION:
Title: ${job.title}
Company: ${job.company.name}
Location: ${job.location?.country}
Description:
${job.description}

---

🚨 OUTPUT OBJECTIVES

You MUST produce:

1. Match Score (ATS + semantic alignment)
2. Keyword overlap analysis
3. Gap analysis (skill + domain + system level)
4. Experience estimation
5. Role fit classification
6. Confidence score

BUT MOST IMPORTANTLY:

👉 You MUST construct a structured JOB CONTEXT BLUEPRINT
that can directly drive resume generation.

---

🚨 JOB CONTEXT BLUEPRINT REQUIREMENTS

You must infer and structure:

## 1. CORE CLASSIFICATION
- domain (single string)
- seniorityLevel (junior | mid | senior | staff | principal)
- systemComplexity:
  ("simple application" |
   "multi-tier application" |
   "distributed system" |
   "enterprise distributed platform" |
   "mission-critical platform")

---

## 2. SYSTEM ARCHITECTURE BREAKDOWN (STRICT STRUCTURE)

You MUST extract system layers:

{
  backend: string[],
  frontend: string[],
  data: string[],
  cloud: string[],
  integration: string[],
  devops: string[]
}

---

## 3. ENGINEERING SIGNAL TAXONOMY

Extract structured signals:

{
  systemCharacteristics: string[],
  architecturalPatterns: string[],
  runtimeConstraints: string[],
  operationalConcerns: string[]
}

---

## 4. CORE RESPONSIBILITIES (NORMALIZED)

Convert job description into categorized engineering responsibilities:

{
  systemDesign: string[],
  backendDevelopment: string[],
  frontendIntegration: string[],
  cloudArchitecture: string[],
  dataSystems: string[],
  devopsDelivery: string[],
  leadershipOwnership: string[]
}

---

## 5. BUSINESS CONTEXT

- businessPriorities: string[]
- inferredChallenges: string[]

Focus on:
- reliability vs speed
- compliance vs innovation
- scale vs maintainability

---

## 6. RESUME SHAPING DIRECTIVES (CRITICAL)

You MUST generate:

{
  emphasize: string[],
  deEmphasize: string[],
  narrativeFocus: string[],
  seniorityBias: "backend-heavy" | "balanced" | "frontend-heavy",
}

Rules:
- emphasize = what MUST be highlighted in resume
- deEmphasize = what should be compressed or ignored
- narrativeFocus = story themes for resume bullets

---

## 7. COMPONENT IMPORTANCE WEIGHTS (0–5)

Assign importance for resume density control:

{
  backend: number,
  frontend: number,
  data: number,
  cloud: number,
  integration: number
}

Rules:
- 5 = critical core of job
- 3 = supporting
- 1 = minimal relevance

---

## 8. ENGINEERING SIGNALS (HIGH LEVEL INTENT)

Derive:

- systemCharacteristics (e.g. distributed, real-time)
- architecturalPatterns (e.g. event-driven, microservices)
- runtimeConstraints (e.g. low latency, high throughput)
- operationalConcerns (e.g. observability, reliability, compliance)

---

---

MATCH ANALYSIS (SECONDARY SIGNAL ONLY)

Score the match 0–100 based on:
- skills overlap
- system similarity
- domain alignment
- seniority alignment

Return:
- score
- strengths
- gaps
- matchedKeywords
- missingKeywords
- experienceMatch (required vs candidate years)
- roleFit (strong | moderate | weak)
- confidence (0–1)

---

🚨 CRITICAL INSTRUCTION

You MUST NOT:
- return flat or unstructured context
- output generic keywords without hierarchy
- mix responsibilities with signals
- collapse frontend/backend/cloud into single list

You MUST:
- structure everything for downstream resume generation
- prioritize system-level interpretation over keyword extraction
- infer architecture even if not explicitly stated

---

OUTPUT FORMAT (STRICT JSON ONLY)

{
  score: number,
  strengths: string[],
  gaps: string[],
  matchedKeywords: string[],
  missingKeywords: string[],
  experienceMatch: {
    requiredYears?: number,
    candidateYears?: number,
    meetsRequirement: boolean
  },
  roleFit: "strong" | "moderate" | "weak",
  roleDomain: "software engineering" | "financial analysis" | "business analysis" | "data analysis" | "tax analysis",
  confidence: number,

  jobContext: {
    domain: string,
    seniorityLevel: string,
    systemComplexity: string,

    systemArchitecture: {
      backend: string[],
      frontend: string[],
      data: string[],
      cloud: string[],
      integration: string[],
      devops: string[]
    },

    engineeringSignals: {
      systemCharacteristics: string[],
      architecturalPatterns: string[],
      runtimeConstraints: string[],
      operationalConcerns: string[]
    },

    coreResponsibilities: {
      systemDesign: string[],
      backendDevelopment: string[],
      frontendIntegration: string[],
      cloudArchitecture: string[],
      dataSystems: string[],
      devopsDelivery: string[],
      leadershipOwnership: string[]
    },

    businessPriorities: string[],
    inferredChallenges: string[],

    resumeShapingDirectives: {
      emphasize: string[],
      deEmphasize: string[],
      narrativeFocus: string[],
      seniorityBias: "backend-heavy" | "balanced" | "frontend-heavy"
    },

    componentImportance: {
      backend: number,
      frontend: number,
      data: number,
      cloud: number,
      integration: number
    }
  }
}

---

FINAL RULE:
Return ONLY valid JSON. No commentary. No markdown.
`;
}


//Generic 
export function buildPromptForGenericJobScore(
  job: Job,
  candidateProfileConfig: CandidateProfileConfig
): string {
  return `
You are an expert AI recruiter and ATS scoring system.

Your task is to evaluate how well a candidate matches a job and return structured scoring output.

Return ONLY valid JSON. No explanations. No markdown.

-----------------------------------
CANDIDATE RESUME:
${candidateProfileConfig.resumeText}
-----------------------------------

JOB DETAILS:
Title: ${job.title}
Company: ${job.company.name}
Location: ${job.location?.country}
Description:
${job.description}
-----------------------------------

SCORING INSTRUCTIONS

Score from 0 to 100 based on:

- Skills match
- Experience relevance
- Role alignment
- Domain/system alignment (important)
- Seniority match

-----------------------------------

EXTRACT:

1. strengths
- Why candidate fits the role
- MUST include system-level or domain-level alignment when applicable

2. gaps
- Missing skills OR missing system/domain exposure
- Do NOT list generic keyword gaps only

3. matchedKeywords
- Key overlapping technical + domain terms

4. missingKeywords
- Critical missing technical + domain terms

-----------------------------------

EXPERIENCE ANALYSIS

- requiredYears → infer from job
- candidateYears → estimate from resume
- If Masters degree → add +2 years to candidateYears
- meetsRequirement → true/false

-----------------------------------

ROLE FIT

- strong → high alignment in domain + systems + seniority
- moderate → partial alignment
- weak → low alignment

-----------------------------------

CONFIDENCE

0 to 1 based on clarity and completeness of job description

-----------------------------------

RETURN FORMAT (STRICT JSON ONLY)

{
  "score": number,
  "strengths": string[],
  "gaps": string[],
  "matchedKeywords": string[],
  "missingKeywords": string[],
  "experienceMatch": {
    "requiredYears": number,
    "candidateYears": number,
    "meetsRequirement": boolean
  },
  "roleFit": "strong" | "moderate" | "weak",
  "roleDomain": "software engineering" | "financial analysis" | "business analysis" | "data analysis" | "tax analysis",
  "confidence": number
}

-----------------------------------

RULES

- No extra text
- No markdown
- No trailing commas
- Must be valid JSON
`;
}