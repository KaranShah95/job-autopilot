export function buildPromptForJobScore(job, resume) {
    return `
You are an expert AI recruiter and ATS scoring system.

Your task is to evaluate how well a candidate matches a job.

Return ONLY valid JSON. Do NOT include explanations or markdown.

-----------------------------------
CANDIDATE RESUME:
${resume}
-----------------------------------

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Description:
${job.description}
-----------------------------------

SCORING INSTRUCTIONS:

1. Score from 0 to 100 based on:
   - Skills match
   - Experience relevance
   - Role alignment
   - Keywords match (important)

2. Extract:
   - strengths: why candidate fits
   - gaps: missing requirements
   - matchedKeywords: key overlapping skills/terms
   - missingKeywords: important missing skills

3. Experience:
   - Estimate requiredYears (if mentioned)
   - Estimate candidateYears (based on resume)
   - meetsRequirement: true/false

4. Role Fit:
   - "strong" → highly aligned role
   - "moderate" → somewhat aligned
   - "weak" → poor alignment

5. Confidence:
   - 0 to 1 based on how clear the match is

-----------------------------------

RETURN FORMAT (STRICT JSON):

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
  "confidence": number
}

Rules:
- No extra text
- No markdown
- No trailing commas
- Must be valid JSON
`;
}
//# sourceMappingURL=buildPromptForJobScore.js.map