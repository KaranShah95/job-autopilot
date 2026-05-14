/* ## For Job-Autopilot Specifically
```
src/
├── domain/
│   ├── job.types.ts          # Job, SearchCriteria, UserProfile interfaces
│   └── job.scoring.ts        # Pure scoring/ranking functions
├── services/
│   ├── adzuna.service.ts     # Implements JobSource
│   └── jsearch.service.ts    # Implements JobSource
├── usecases/
│   ├── fetchJobs.ts          # Orchestrates multiple sources
│   └── deduplicateJobs.ts
├── repositories/
│   └── job.repository.ts     # Save/query jobs from DB
└── workers/
    └── jobSync.worker.ts     # Cron: runs fetchJobs on schedule */
//console.log("Hello, TypeScript + Node.js!");
// src/index.ts
import { loadCandidateProfileConfig } from "./services/CandidateProfileConfigLoader.js";
import { ResumeManager } from "./services/ResumeManager.js";
import { AdzunaService } from "./services/AdzunaService.js";
import { OpenAIJobScorer } from "./services/OpenAIJobScorer.js";
async function main() {
    try {
        // Load candidate profile config
        const candidateConfig = loadCandidateProfileConfig("./candidateProfileConfig.json");
        if (!candidateConfig) {
            console.error("Failed to load candidate profile. Exiting...");
            process.exit(1);
        }
        // Load candidate resume
        const resumeManager = new ResumeManager();
        try {
            await resumeManager.loadResume(candidateConfig.resumeFilePath);
            const resumeText = resumeManager.getResume();
            console.log("Resume preview:", resumeText.slice(0, 200), "...");
        }
        catch (err) {
            console.error("Failed to load resume:", err);
        }
        const jobSource = new AdzunaService();
        // Fetch jobs based on candidate's jobSearchCriteria
        console.log("[INFO] Fetching jobs...");
        const jobs = await jobSource.getJobsAsync(candidateConfig.jobSearchCriteria);
        console.log(`[INFO] Retrieved ${jobs.length} jobs`);
        // Print sample jobs
        jobs.slice(0, 3).forEach((job, index) => {
            console.log(`\n[JOB ${index + 1}]`);
            console.log("Title:", job.title);
            console.log("Company:", job.company.name);
            console.log("Location:", job.location);
        });
        // Score jobs
        // const scorer = new OpenAIJobScorer(resumeText);
        // const scoredJobs = await scorer.ScoreJobsAsync(jobs);
        // console.log("Top 5 scored jobs:", scoredJobs.slice(0, 5));
    }
    catch (err) {
        console.error("Error in main pipeline:", err);
    }
}
main();
//# sourceMappingURL=index.js.map