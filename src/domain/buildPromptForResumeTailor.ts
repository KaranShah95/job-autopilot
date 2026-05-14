import type {Job} from './Job.js'; 
import type {JobScore} from './JobScore.js'; 
import type { CandidateProfileConfig } from './CandidateProfileConfig.js';

export function buildPromptForResumeTailor(
  job: Job,
  candidateProfileConfig: CandidateProfileConfig
): string {

   if (job.relevanceScore?.roleDomain === "software engineering" || candidateProfileConfig.isSoftwareEngineer)
   {
      console.log(`[INFO] Using Software Engineer ResumeTailor prompt.....`);
      return buildPromptForSoftwareEngineerResumeTailor(job, candidateProfileConfig);
   }
   if (job.relevanceScore?.roleDomain === "financial analysis")
   {
      console.log(`[INFO] Using Financial Analyst ResumeTailor prompt.....`);
      return buildPromptForFinancialAnalystResumeTailor(job, candidateProfileConfig);
   }
   if (job.relevanceScore?.roleDomain === "business analysis")
   {
      console.log(`[INFO] Using Business Analyst ResumeTailor prompt.....`);
      return buildPromptForBusinessAnalystResumeTailor(job, candidateProfileConfig);
   }
   return "";
}

export function buildPromptForFinancialAnalystResumeTailor(
  job: Job,
  candidateProfileConfig: CandidateProfileConfig
): string {
  return `
ROLE: You are an Elite ATS Resume Optimization Engine and Financial Domain Resume Expert.

OBJECTIVE:
Generate a HIGHLY OPTIMIZED, ATS-dominant resume tailored for the ${job.title} role at ${job.company.name} (${job.location?.country}) that OUTPERFORMS typical applicants in keyword match, domain alignment, and recruiter readability.

This resume MUST score higher than average ATS thresholds (85+ equivalent).

========================
MATCH ANALYSIS
========================
Score: ${job.relevanceScore?.score}

Strengths:
${job.relevanceScore?.strengths.join("\n")}

Gaps:
${job.relevanceScore?.gaps.join("\n")}

Matched Keywords:
${job.relevanceScore?.matchedKeywords.join(", ")}

Missing Keywords:
${job.relevanceScore?.missingKeywords.join(", ")}

Role Fit: ${job.relevanceScore?.roleFit}

========================
MASTER RESUME
========================
${candidateProfileConfig.resumeText}

========================
CRITICAL OPTIMIZATION RULES (MANDATORY)
========================

1. ATS KEYWORD MAXIMIZATION (HIGHEST PRIORITY)
- You MUST incorporate at least 85–95% of BOTH:
  - Matched Keywords
  - Missing Keywords
- If a keyword is missing but logically inferable from experience, INCLUDE it naturally.
- Distribute keywords across:
  - Summary
  - Experience bullets
  - Skills section
- DO NOT keyword dump. Maintain readability.

2. FINANCIAL DOMAIN ENFORCEMENT (STRICT)
For finance roles, you MUST explicitly include (if even remotely supported by experience or education):
- Financial Modeling
- Forecasting / Budgeting
- Variance Analysis
- Valuation concepts (IRR, NPV, DCF)
- Pro Forma Analysis
- Market / Investment Analysis

If not directly stated, derive from:
- Projects
- Coursework
- Analytical work

3. BULLET REWRITE FORMULA (MANDATORY)
Every bullet MUST follow this structure:
[ACTION VERB] + [WHAT YOU DID] + [TOOL/TECH] + [BUSINESS PURPOSE] + [QUANTIFIED IMPACT]

Example:
"Developed **financial models** in **Excel** to support **forecasting and variance analysis**, improving reporting accuracy by **25%**."

4. SUMMARY (CRITICAL FOR ATS RANKING)
- 3–5 lines MAX
- MUST include:
  - Job title (${job.title})
  - 5–8 HIGH-VALUE KEYWORDS
  - Domain alignment (finance / investment / portfolio)
- Avoid generic phrases like "detail-oriented"

5. EXPERIENCE OPTIMIZATION
- High relevance roles: 4–6 bullets
- Low relevance roles: 2–3 bullets
- Prioritize:
  - Financial analysis
  - Data-driven decision making
  - Cross-functional collaboration
- Inject missing keywords into bullets wherever possible

6. PROJECT SECTION (IMPORTANT – DO NOT SKIP)
Unlike default rules:
- INCLUDE 1–2 HIGH-VALUE PROJECTS if they help:
  - Add missing keywords (e.g., modeling, forecasting, valuation)
  - Demonstrate domain relevance (finance, analytics, investment)
- Rewrite projects to feel like PROFESSIONAL EXPERIENCE

7. SKILLS SECTION (ATS BOOSTER)
- Categorize skills clearly
- Ensure ALL critical keywords appear here if not elsewhere
- Include:
  - Tools (Excel, SQL, Tableau, etc.)
  - Financial concepts (IRR, NPV, Financial Modeling)

8. KEYWORD EMPHASIS
- Bold ALL:
  - Keywords
  - Tools
  - Financial concepts
  - Metrics (% / $ / numbers)

9. NO WEAK BULLETS
Avoid:
- “Responsible for”
- “Assisted with”

Replace with strong ownership language:
- “Analyzed”
- “Developed”
- “Led”
- “Optimized”

10. NO HALLUCINATION RULE
- DO NOT invent experience
- You MAY:
  - Reframe
  - Combine
  - Elevate wording
  - Infer logical skills

========================
OUTPUT FORMAT (STRICT JSON)
========================

Return ONLY valid JSON matching ResumeSection schema.

- Ensure:
  - High keyword density
  - Strong metrics
  - Financial domain alignment
  - Clean, ATS-friendly structure

- This resume should clearly outperform a typical financial analyst resume in:
  - Keyword match
  - Clarity
  - Impact
  - Relevance

JSON schema:
{
  contact?: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  },
  summary?: string,
  keyAchievements?: string[],
  experience: {
    title: string;
    company: string;
    location?: string;
    duration: string;
    bullets: string[];
  }[],
  projects?: {
    name: string;
    description: string;
    technologies?: string[];
    bullets?: string[];
    url?: string;
  }[],
  education?: {
    degree: string;
    institution: string;
    year: string;
    city?: string,
    state?: string,
    country?: string,
    gpa?: string;
  }[],
  skills?: {
    title?: string;
    categories: {
      category?: string;
      skills: string[];
    }[];
  },
  certifications?: string[]
}
`;
}

//For BA
export function buildPromptForBusinessAnalystResumeTailor(
  job: Job,
  candidateProfileConfig: CandidateProfileConfig
): string {
  return `
ROLE: You are an Elite ATS Resume Optimization Engine specializing in Business Analytics, Data Analysis, and Financial Modeling roles.

OBJECTIVE:
Generate a HIGHLY OPTIMIZED, ATS-dominant resume tailored for the ${job.title} role at ${job.company.name} (${job.location?.country}).

This resume MUST achieve a 90+ ATS-equivalent score by maximizing:
- Keyword match
- Business analytics relevance
- Data + strategy alignment
- Recruiter readability

========================
MATCH ANALYSIS
========================
Score: ${job.relevanceScore?.score}

Strengths:
${job.relevanceScore?.strengths.join("\n")}

Gaps:
${job.relevanceScore?.gaps.join("\n")}

Matched Keywords:
${job.relevanceScore?.matchedKeywords.join(", ")}

Missing Keywords:
${job.relevanceScore?.missingKeywords.join(", ")}

Role Fit: ${job.relevanceScore?.roleFit}

========================
MASTER RESUME
========================
${candidateProfileConfig.resumeText}

========================
CRITICAL OPTIMIZATION RULES (MANDATORY)
========================

1. ATS KEYWORD DOMINANCE (HIGHEST PRIORITY)
- You MUST incorporate 90–100% of:
  - Matched Keywords
  - Missing Keywords
- Keywords MUST appear across:
  - Summary
  - Experience bullets
  - Skills section
- Maintain natural readability (no keyword stuffing)

2. BUSINESS ANALYTICS + BI ENFORCEMENT (STRICT)
You MUST explicitly include (if logically supported):
- **Data Analysis**
- **SQL / Tableau / Excel / Python**
- **Business Intelligence (BI tools)**
- **Financial Modeling**
- **Forecasting & Product Performance Analysis**
- **Customer Acquisition / Growth Strategy**
- **Quantitative Analysis**
- **Data-Driven Decision Making**
- **Stakeholder Communication / Insights Presentation**

If not directly stated:
- Infer from analytical work, projects, or reporting tasks

3. BULLET REWRITE FORMULA (MANDATORY)
Every bullet MUST follow:
[ACTION] + [ANALYSIS/TOOL] + [BUSINESS CONTEXT] + [IMPACT + METRIC]

Example:
"Analyzed **customer data using SQL and Tableau** to support **customer acquisition strategy**, improving campaign efficiency by **30%**."

4. SUMMARY (HIGH IMPACT)
- 3–4 lines MAX
- MUST include:
  - Job title (${job.title})
  - 6–10 critical keywords (SQL, Tableau, BI, forecasting, modeling, etc.)
  - Strong business impact language
- MUST position candidate as:
  → Data-driven decision maker
  → Strategic problem solver

5. EXPERIENCE OPTIMIZATION
- High relevance roles: 5–6 bullets
- Others: 2–3 bullets
- Every role MUST include:
  - Data analysis
  - Business impact
  - Tools used
- Inject keywords like:
  - "stakeholders"
  - "forecasting"
  - "business performance"
  - "strategic insights"

6. PROJECT SECTION (MANDATORY FOR 90+ SCORE)
- Include 1–2 projects IF they:
  - Show SQL / Tableau / modeling / forecasting
  - Demonstrate business impact
- Rewrite projects like real work experience
- Add metrics wherever possible

7. SKILLS SECTION (ATS BOOST ENGINE)
- MUST include ALL:
  - SQL, Tableau, Excel, Python (if present)
  - BI Tools
  - Data Analysis
  - Financial Modeling
  - Forecasting
- Group into:
  - Technical Skills
  - Analytical Skills
  - Tools

8. KEYWORD EMPHASIS
- Bold ALL:
  - Keywords
  - Tools (SQL, Tableau, Excel, Python)
  - Business concepts (forecasting, modeling, BI)
  - Metrics (% / numbers)

9. BUSINESS IMPACT LANGUAGE (CRITICAL)
Replace weak phrasing with:
- “Drove”
- “Optimized”
- “Influenced”
- “Improved business performance”
- “Generated insights”

10. NO HALLUCINATION RULE
- DO NOT invent experience
- You MAY:
  - Reframe
  - Elevate wording
  - Infer logical skills

========================
OUTPUT FORMAT (STRICT JSON)
========================

Return ONLY valid JSON matching ResumeSection schema.

Ensure:
- Extremely high keyword density
- Strong metrics in EVERY role
- Clear alignment with Business Analyst responsibilities
- Clean ATS-friendly structure

This resume MUST clearly outperform typical applicants in:
- SQL / Tableau / BI keyword match
- Business impact storytelling
- Data-driven decision making

JSON schema:
{
  contact?: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  },
  summary?: string,
  keyAchievements?: string[],
  experience: {
    title: string;
    company: string;
    location?: string;
    duration: string;
    bullets: string[];
  }[],
  projects?: {
    name: string;
    description: string;
    technologies?: string[];
    bullets?: string[];
    url?: string;
  }[],
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[],
  skills?: {
    title?: string;
    categories: {
      category?: string;
      skills: string[];
    }[];
  },
  certifications?: string[]
}
`;
}

export function buildPromptForSoftwareEngineerResumeTailor(
  job: Job,
  candidateProfileConfig: CandidateProfileConfig
): string {
  return `
Tailor the provided RESUME to align and match with the specific JOB provided.

----------------------------------------
INPUT
----------------------------------------

JOB:
{COMPANY_NAME: ${job.company.name}}
{JOB_TITLE: ${job.title}}
{JOB_LOCATION: ${job.location?.country}}
{RAW_JOB_TEXT: ${job.description}}

RESUME:
<${candidateProfileConfig.resumeText}>

----------------------------------------

OUTPUT FORMAT (STRICT JSON ONLY)

{
  contact?: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  },
  summary?: string,
  keyAchievements?: string[],
  experience: {
    title: string;
    company: string;
    location?: string;
    duration: string;
    bullets: string[];
  }[],
  projects?: {
    name: string;
    description: string;
    technologies?: string[];
    bullets?: string[];
    url?: string;
  }[],
  education?: {
    degree: string;
    institution: string;
    year: string;
    city?: string,
    state?: string,
    country?: string,
    gpa?: string;
  }[],
  skills?: {
    title?: string;
    categories: {
      category?: string;
      skills: string[];
    }[];
  },
  certifications?: string[]
}

---

RETURN ONLY VALID JSON.
`;
}

//Prompt with multi dimension JobContext
// export function buildPromptForSoftwareEngineerResumeTailor(
//   job: Job,
//   candidateProfileConfig: CandidateProfileConfig
// ): string {
//   return `
// ROLE:
// You are a Staff-level Technical Resume Architect and Systems Narrative Engineer.

// You do NOT summarize resumes.
// You CONSTRUCT senior-level engineering narratives optimized for ATS + human technical hiring managers.

// ---

// TARGET ROLE
// - Title: ${job.title}
// - Company: ${job.company.name}
// - Location: ${job.location?.country}

// ---

// 🚨 JOB CONTEXT = RESUME CONSTRUCTION BLUEPRINT (CRITICAL)

// You MUST treat Job Context as a deterministic instruction system, not descriptive metadata.

// ---

// CORE CLASSIFICATION
// - Domain: ${job.relevanceScore?.jobContext?.domain}
// - Seniority Level: ${job.relevanceScore?.jobContext?.seniorityLevel}
// - System Complexity: ${job.relevanceScore?.jobContext?.systemComplexity}

// ---

// SYSTEM IMPORTANCE WEIGHTS (DRIVES BULLET DEPTH)
// - Backend Importance: ${job.relevanceScore?.jobContext?.componentImportance?.backend}
// - Frontend Importance: ${job.relevanceScore?.jobContext?.componentImportance?.frontend}
// - Data Importance: ${job.relevanceScore?.jobContext?.componentImportance?.data}
// - Cloud Importance: ${job.relevanceScore?.jobContext?.componentImportance?.cloud}
// - Integration Importance: ${job.relevanceScore?.jobContext?.componentImportance?.integration}

// ---

// SYSTEM ARCHITECTURE MODEL (USE TO SHAPE EXPERIENCE SECTIONS)

// Backend:
// ${job.relevanceScore?.jobContext?.systemArchitecture?.backend?.join(", ")}

// Frontend:
// ${job.relevanceScore?.jobContext?.systemArchitecture?.frontend?.join(", ")}

// Data Systems:
// ${job.relevanceScore?.jobContext?.systemArchitecture?.data?.join(", ")}

// Cloud:
// ${job.relevanceScore?.jobContext?.systemArchitecture?.cloud?.join(", ")}

// Integration:
// ${job.relevanceScore?.jobContext?.systemArchitecture?.integration?.join(", ")}

// ---

// ENGINEERING SIGNALS (MUST INFLUENCE BULLETS)

// System Characteristics:
// ${job.relevanceScore?.jobContext?.engineeringSignals?.systemCharacteristics?.join(", ")}

// Architectural Patterns:
// ${job.relevanceScore?.jobContext?.engineeringSignals?.architecturalPatterns?.join(", ")}

// Runtime Constraints:
// ${job.relevanceScore?.jobContext?.engineeringSignals?.runtimeConstraints?.join(", ")}

// Operational Concerns:
// ${job.relevanceScore?.jobContext?.engineeringSignals?.operationalConcerns?.join(", ")}

// ---

// RESUME SHAPING DIRECTIVES (MANDATORY)

// Emphasize:
// ${job.relevanceScore?.jobContext?.resumeShapingDirectives?.emphasize?.join(", ")}

// De-Emphasize:
// ${job.relevanceScore?.jobContext?.resumeShapingDirectives?.deEmphasize?.join(", ")}

// Narrative Focus:
// ${job.relevanceScore?.jobContext?.resumeShapingDirectives?.narrativeFocus?.join(", ")}

// Seniority Bias:
// ${job.relevanceScore?.jobContext?.resumeShapingDirectives?.seniorityBias}

// ---

// CORE RESPONSIBILITIES (NORMALIZED INTENT MODEL)

// System Design:
// ${job.relevanceScore?.jobContext?.coreResponsibilities?.systemDesign?.join(" | ")}

// Backend:
// ${job.relevanceScore?.jobContext?.coreResponsibilities?.backendDevelopment?.join(" | ")}

// Frontend:
// ${job.relevanceScore?.jobContext?.coreResponsibilities?.frontendIntegration?.join(" | ")}

// Cloud:
// ${job.relevanceScore?.jobContext?.coreResponsibilities?.cloudArchitecture?.join(" | ")}

// Data:
// ${job.relevanceScore?.jobContext?.coreResponsibilities?.dataSystems?.join(" | ")}

// DevOps:
// ${job.relevanceScore?.jobContext?.coreResponsibilities?.devopsDelivery?.join(" | ")}

// Leadership:
// ${job.relevanceScore?.jobContext?.coreResponsibilities?.leadershipOwnership?.join(" | ")}

// ---

// INFERRRED SYSTEM CHALLENGES (WHAT THE JOB IS REALLY SOLVING)
// ${job.relevanceScore?.jobContext?.inferredChallenges?.join(" | ")}

// ---

// MATCH ANALYSIS (SECONDARY SIGNAL ONLY)
// Score: ${job.relevanceScore?.score}

// Strengths:
// ${job.relevanceScore?.strengths?.join("\n")}

// Gaps:
// ${job.relevanceScore?.gaps?.join("\n")}

// Matched Keywords:
// ${job.relevanceScore?.matchedKeywords?.join(", ")}

// Missing Keywords:
// ${job.relevanceScore?.missingKeywords?.join(", ")}

// Role Fit: ${job.relevanceScore?.roleFit}

// ---

// MASTER RESUME
// ${candidateProfileConfig.resumeText}

// ---

// 🚨 EXECUTION RULES (CRITICAL BEHAVIORAL OVERRIDES)

// 1. Job Context overrides ALL other signals
// 2. Resume must reflect system architecture hierarchy
// 3. Component importance determines bullet density
// 4. MUST preserve ALL numeric metrics (NO EXCEPTIONS)
// 5. MUST NOT generalize or remove:
//    - team sizes
//    - revenue
//    - performance multipliers
//    - data scale
//    - deployment scale

// ---

// SENIORITY CONSTRUCTION RULE

// Each HIGH-relevance experience MUST include:

// - Architecture depth (system design decisions)
// - Scale (users, data, systems, throughput)
// - Ownership (end-to-end responsibility)
// - Cross-Functional Leadership (hardware, product, scientists)
// - Business Impact (revenue, reliability, compliance)
// - Complexity (distributed, real-time, regulated)
// - Metrics (mandatory if available)
// - Include 5–6 bullets

// LOW-relevance roles:
// - Only transferable architecture + impact
// - Ownership (end-to-end responsibility)
// - Cross-Functional Leadership (hardware, product, scientists)
// - Business Impact (revenue, reliability, compliance)
// - Include 2–3 bullets

// ---

// BULLET GENERATION RULE (CONTROLLED DENSITY)

// Use componentImportance to decide emphasis:

// - backend ≥ 4 → increase architecture + system bullets
// - integration ≥ 4 → emphasize APIs, system linking
// - cloud ≥ 4 → emphasize Azure, distributed infra
// - frontend ≥ 4 → include UI architecture depth
// - data ≥ 4 → emphasize pipelines, scale, processing

// ---

// BULLET STRUCTURE

// Each bullet must follow:

// [Action Verb] + [System/Scope] + [Technical Depth] + [Impact]

// Example:
// "Architected distributed system in C# enabling real-time data processing across hardware-integrated pipelines"

// ---

// METRIC PRESERVATION (ABSOLUTE RULE)

// NEVER convert:
// - "$1.5M" → "significant revenue"
// - "3–8 engineers" → "small team"
// - "80–100 TB" → "large scale data"
// - "30× improvement" → "significant improvement"

// Metrics must always be preserved verbatim or expanded, never removed.

// ---

// PROJECT FILTER RULE

// Exclude ALL projects unless:
// - directly relevant to job domain OR
// - demonstrate required technologies

// ---

// OUTPUT FORMAT (STRICT JSON ONLY)

// {
//   contact?: {
//     name: string;
//     email?: string;
//     phone?: string;
//     location?: string;
//     linkedin?: string;
//     github?: string;
//     portfolio?: string;
//   },
//   summary?: string,
//   keyAchievements?: string[],
//   experience: {
//     title: string;
//     company: string;
//     location?: string;
//     duration: string;
//     bullets: string[];
//   }[],
//   projects?: {
//     name: string;
//     description: string;
//     technologies?: string[];
//     bullets?: string[];
//     url?: string;
//   }[],
//   education?: {
//     degree: string;
//     institution: string;
//     year: string;
//     city?: string,
//     state?: string,
//     country?: string,
//     gpa?: string;
//   }[],
//   skills?: {
//     title?: string;
//     categories: {
//       category?: string;
//       skills: string[];
//     }[];
//   },
//   certifications?: string[]
// }

// ---

// FINAL VALIDATION CHECK (MANDATORY INTERNAL STEP)

// Before output:

// ✔ JobContext fully applied as blueprint
// ✔ Metrics preserved exactly
// ✔ Seniority signals visible in every key role
// ✔ No generic bullets
// ✔ Architecture hierarchy reflected
// ✔ Component importance respected

// ---

// RETURN ONLY VALID JSON.
// `;
// }