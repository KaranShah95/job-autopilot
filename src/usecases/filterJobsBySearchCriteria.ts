import type { Job } from "../domain/Job.js";
import type { SearchCriteria } from "../domain/SearchCriteria.js";

export function filterJobsBySearchCriteria(
  jobs: Job[],
  criteria: SearchCriteria,
  debug = true
): Job[] {
  const log = (...args: any[]) => {
    if (debug) console.log("[JobFilter]", ...args);
  };

  const safeLower = (v: unknown) =>
    typeof v === "string" ? v.toLowerCase() : "";

  log("Starting filtering process...");
  log("Total jobs received:", jobs.length);
  log("Search criteria:", JSON.stringify(criteria, null, 2));

  const filtered: Job[] = [];

  for (const job of jobs) {
    try {
      log("--------------------------------------------------");
      log(`Evaluating job: ${job.id}`);
      log(`Title: ${job.title}`);
      log(`Company: ${job.company?.name}`);

      let include = true;

      // -----------------------------
      // 1. Keywords
      // -----------------------------
      if (criteria.keywords?.length) {
        const text = `
          ${job.title}
          ${job.description}
          ${(job.skills ?? []).join(" ")}
        `.toLowerCase();

        const matches = criteria.keywords.filter((kw) =>
          text.includes(kw.toLowerCase())
        );

        log("Keyword check:");
        log("  Required:", criteria.keywords);
        log("  Matched:", matches);

        if (matches.length === 0) {
          log("❌ Failed keyword filter");
          include = false;
        }
      }

      // -----------------------------
      // 2. Company
      // -----------------------------
      if (include && criteria.company) {
        const match =
          safeLower(job.company?.name) === safeLower(criteria.company);

        log("Company check:", {
          required: criteria.company,
          actual: job.company?.name,
          match,
        });

        if (!match) {
          log("❌ Failed company filter");
          include = false;
        }
      }

      // -----------------------------
      // 3. Job type
      // -----------------------------
      if (include && criteria.jobType?.length) {
        const jobTypes = job.jobType ?? [];

        const matches = criteria.jobType.filter((t) =>
          jobTypes.includes(t)
        );

        log("Job type check:", {
          required: criteria.jobType,
          actual: jobTypes,
          matches,
        });

        if (matches.length === 0) {
          log("❌ Failed job type filter");
          include = false;
        }
      }

      // -----------------------------
      // 4. Work mode
      // -----------------------------
      if (include && criteria.workMode?.length) {
        const modes = job.workMode ?? [];

        const matches = criteria.workMode.filter((m) =>
          modes.includes(m)
        );

        log("Work mode check:", {
          required: criteria.workMode,
          actual: modes,
          matches,
        });

        if (matches.length === 0) {
          log("❌ Failed work mode filter");
          include = false;
        }
      }

      // -----------------------------
      // 5. Experience
      // -----------------------------
      if (include && criteria.experienceLevel?.length) {
        const text = `
            ${job.title}
            ${job.description}
        `.toLowerCase();

        const jobLevels = job.experienceLevel ?? [];

        const levelMatches = criteria.experienceLevel.filter((cLevel) =>
            jobLevels.some((jLevel) => jLevel.level === cLevel.level)
        );

        // fallback: text-based detection
        const textMatches = criteria.experienceLevel.filter((cLevel) => {
            switch (cLevel.level) {
            case "senior":
                return /senior|5\+|6\+|7\+|8\+ years/.test(text);
            case "mid":
                return /mid|3\+|4\+|5\+ years/.test(text);
            case "entry":
                return /entry|junior|0\+|1\+|2\+ years/.test(text);
            case "lead":
                return /lead|staff|principal/.test(text);
            default:
                return false;
            }
        });

        const hasMatch = levelMatches.length > 0 || textMatches.length > 0;

        log("Experience check FIXED:", {
            structuredMatches: levelMatches,
            textMatches,
            hasMatch,
        });

        if (!hasMatch) {
            log("❌ Failed experience filter");
            include = false;
        }
        }
      // -----------------------------
      // 6. Location
      // -----------------------------
      if (include && criteria.locations?.length) {
        const jobLoc = job.location;

        if (!jobLoc) {
          log("❌ No job location available");
          include = false;
        } else {
          const matches = criteria.locations.filter((loc) => {
            return (
              (!loc.city || loc.city === jobLoc.city) &&
              (!loc.state || loc.state === jobLoc.state) //&&
              //(!loc.country || loc.country === jobLoc.country) //Skip filterinig by country since Azure Base URL is country specific
            );
          });

          log("Location check:", {
            required: criteria.locations,
            actual: jobLoc,
            matches,
          });

          if (matches.length === 0) {
            log("❌ Failed location filter");
            include = false;
          }
        }
      }

      // -----------------------------
      // 7. Visa sponsorship
      // -----------------------------
      if (include && criteria.isVisaSponsorshipRequired) {
        const text = job.description.toLowerCase();

        const restricted = /no sponsorship|citizens only|must be authorized/i.test(
          text
        );

        log("Visa check:", {
          required: criteria.isVisaSponsorshipRequired,
          restricted,
        });

        if (restricted) {
          log("❌ Failed visa filter");
          include = false;
        }
      }

      // -----------------------------
      // Final decision
      // -----------------------------
      if (include) {
        log("✅ Job PASSED filter:", job.id);
        filtered.push(job);
      } else {
        log("🚫 Job REJECTED:", job.id);
      }
    } catch (err) {
      console.error("[JobFilter] Error processing job:", job.id, err);
      // fail-safe: skip job but don't crash pipeline
    }
  }

  log("--------------------------------------------------");
  log("Filtering complete");
  log("Input jobs:", jobs.length);
  log("Filtered jobs:", filtered.length);

  return filtered;
}