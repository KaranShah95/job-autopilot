import fs from "fs";
import path from "path";
import type { Job } from "../domain/Job.js";

export const readManualJobsFromJsonFile = async (
  jsonFilePath: string
): Promise<Job[]> => {
  try {
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`JSON file does not exist: ${jsonFilePath}`);
    }

    console.log(`[INFO] Reading jobs JSON from: ${jsonFilePath}`);

    const rawData = await fs.promises.readFile(jsonFilePath, "utf-8");
    const jobs: Job[] = JSON.parse(rawData);

    console.log(`[INFO] Loaded ${jobs.length} jobs`);

    return jobs;

  } catch (error) {
    console.error("[ERROR] Failed to read jobs JSON:", error);
    throw error;
  }
};