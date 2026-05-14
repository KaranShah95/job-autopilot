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

import { loadCandidateProfileConfig } from "./configs/CandidateProfileConfigLoader.js";
import { loadAppConfig } from "./configs/appConfigLoader.js";
import { ResumeManager } from "./services/ResumeManager.js";
import { AdzunaService } from "./services/AdzunaService.js";
import { fetchJobs } from "./usecases/fetchJobs.js";
import { deduplicateJobs } from "./usecases/deduplicateJobs.js";
import type { IProcessedJobsPersistenceManager } from "./repositories/IProcessedJobsPersistenceManager.js";
import {FileSystemProcessedJobsPersistenceManager} from "./repositories/FileSystemProcessedJobsPersistenceManager.js"
import type { Job } from "./domain/Job.js";
import type { IJobSource } from "./services/IJobSource.js";
import { OpenAIJobScorer } from "./services/OpenAIJobScorer.js";
import { processJobsAsync } from "./usecases/processJobsAsync.js";
import { OpenAIResumeTailor } from "./services/OpenAIResumeTailor.js";
import { readManualJobsFromJsonFile } from "./usecases/readManualJobsFromJsonFile.js";
import { filterJobsBySearchCriteria } from "./usecases/filterJobsBySearchCriteria.js";
import { readManualTailoredResumeFromJsonFile } from "./usecases/readManualTailoredResumeFromJsonFile.js";
import { saveTailoredResume } from "./usecases/saveTailoredResume.js";

async function main() {
  try {

    //Check all the schemas if they are broken before starting the execution:
    // Run once during app startup
    //ResumeSectionSchema.parse({});
    
    
    // Load app config
    const appConfig = loadAppConfig("./appConfig.json");
    if (!appConfig) {
        throw new Error("Failed to load app config.");
    }

    // Load candidate profile config
    const candidateConfig = loadCandidateProfileConfig("./candidateProfileConfig.json");
    if (!candidateConfig) {
        throw new Error("Failed to load candidate profile.");
    }

    const resumeManager = new ResumeManager();
    if (appConfig.saveTailoredResumeOnly)
    {

        if (!appConfig.manualTailoredResumeJSONFilePath) {
        throw new Error("Only Save Tailored Resume mode enabled but no file path provided.");
        }

        try {
            console.log(`[INFO] Reading manual tailored resume from: ${appConfig.manualTailoredResumeJSONFilePath}`);

            const manualTailoredResume = await readManualTailoredResumeFromJsonFile(
                appConfig.manualTailoredResumeJSONFilePath
            );

            const savedPaths = await saveTailoredResume(
                    resumeManager,
                    manualTailoredResume,
                    appConfig.tailoredResumeOutputDirectory
                    );
            
            console.log(
                `✅ "${manualTailoredResume.job.title}" → JSON: ${savedPaths.jsonPath}, DOCX: ${savedPaths.docxPath}`
            );
            return;
        } catch (err) {
        console.error("❌ Manual Tailored Resume saving failed:", err);
        throw err; // fail fast (intentional mode)
        }
    }

    //load resume
    try {
        await resumeManager.loadResume(candidateConfig.resumeFilePath);
        const resumeText = resumeManager.getResume();
        candidateConfig.resumeText = resumeText;
        console.log("Resume preview:", resumeText.slice(0, 200), "...");
    } catch (err) {
        console.error("Failed to load resume:", err);
        throw err;
    }

    const persistenceManager = new FileSystemProcessedJobsPersistenceManager(appConfig.persistenceFilePath);
    const persistedJobs = await persistenceManager.getJobIdsFromPersistenceAsync();

    const jobScorer = new OpenAIJobScorer();
    const resumeTailor = new OpenAIResumeTailor();

    try {
    // =====================================================
    // 🔹 MANUAL JOBS FLOW
    // =====================================================
    if (appConfig.processManualJobsOnly) {
        console.log("🧾 Manual jobs mode ENABLED");

        if (!appConfig.manualJobsJSONFilePath) {
        throw new Error("Manual jobs mode enabled but no file path provided.");
        }

        try {
        console.log(`[INFO] Reading manual jobs from: ${appConfig.manualJobsJSONFilePath}`);

        const manualJobs = await readManualJobsFromJsonFile(
            appConfig.manualJobsJSONFilePath
        );

        console.log('[INFO] Manual job objects:', manualJobs);
        console.log(`[INFO] Loaded ${manualJobs.length} manual jobs`);

        const uniqueManualJobs = deduplicateJobs(manualJobs, persistedJobs);

        console.log(
            `[INFO] ${uniqueManualJobs.length} manual jobs after deduplication`
        );

        if (uniqueManualJobs.length === 0) {
            console.log("⏭️ No new manual jobs to process");
            return; // ✅ EXIT EARLY
        }

        await processJobsAsync(
            uniqueManualJobs,
            candidateConfig,
            2,
            jobScorer,
            resumeTailor,
            resumeManager,
            persistenceManager,
            appConfig
        );

        console.log("✅ Manual jobs processing complete");
        return; // ✅ CRITICAL: skip Adzuna flow

        } catch (err) {
        console.error("❌ Manual jobs processing failed:", err);
        throw err; // fail fast (intentional mode)
        }
    }

    // =====================================================
    // 🔹 ADZUNA FLOW
    // =====================================================
    console.log("🌐 Fetching jobs from Adzuna...");

    let jobs: Job[] = [];

    try {
        jobs = await fetchJobs(
        new AdzunaService(),
        candidateConfig.jobSearchCriteria
        );

        console.log(`[INFO] Fetched ${jobs.length} jobs`);

    } catch (err) {
        console.error("❌ Failed to fetch jobs from Adzuna:", err);
        return; // graceful exit
    }

    if (jobs.length === 0) {
        console.log("⏭️ No jobs fetched. Exiting.");
        return;
    }

    // =====================================================
    // 🔹 FILTERING
    // =====================================================
    const filteredBySearchCriteria = filterJobsBySearchCriteria(
        jobs,
        candidateConfig.jobSearchCriteria
    );

    console.log(
        `[INFO] ${filteredBySearchCriteria.length} jobs after search criteria filtering`
    );

    if (filteredBySearchCriteria.length === 0) {
        console.log("⏭️ No jobs after filtering. Exiting.");
        return;
    }

    // =====================================================
    // 🔹 DEDUPLICATION
    // =====================================================
    const uniqueNewJobs = deduplicateJobs(
        filteredBySearchCriteria,
        persistedJobs
    );

    console.log(
        `[INFO] ${uniqueNewJobs.length} new jobs after deduplication`
    );

    if (uniqueNewJobs.length === 0) {
        console.log("⏭️ No new jobs to process. Exiting.");
        return;
    }

    // =====================================================
    // 🔹 PROCESS PIPELINE
    // =====================================================
    try {
        await processJobsAsync(
        uniqueNewJobs,
        candidateConfig,
        2,
        jobScorer,
        resumeTailor,
        resumeManager,
        persistenceManager,
        appConfig
        );

        console.log("✅ Adzuna jobs processing complete");

    } catch (err) {
        console.error("❌ Failed during job processing pipeline:", err);
        throw err;
    }

    } catch (err) {
    console.error("💥 Fatal error in job orchestration:", err);
    throw err;
    }

  } catch (err) {
    console.error("Error in main pipeline:", err);
  }
}

main();