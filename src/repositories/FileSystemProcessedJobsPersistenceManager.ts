import { promises as fs } from "fs";
import path from "path";
import type { Job } from "../domain/Job.js";
import type { IProcessedJobsPersistenceManager } from "./IProcessedJobsPersistenceManager.js";
import crypto from "crypto";

/**
 * File-based persistence manager with atomic writes, retries, and file locking.
 */
export class FileSystemProcessedJobsPersistenceManager implements IProcessedJobsPersistenceManager {
  private filePath: string;
  private lockFilePath: string;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(
    fileName: string,
    maxRetries: number = 3,
    retryDelayMs: number = 200
  ) {
    this.filePath = path.resolve(process.cwd(), fileName);
    this.lockFilePath = this.filePath + ".lock";
    this.maxRetries = maxRetries;
    this.retryDelayMs = retryDelayMs;
  }

  private async acquireLock(): Promise<void> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        await fs.writeFile(this.lockFilePath, process.pid.toString(), { flag: "wx" });
        console.log("[INFO] Lock acquired");
        return;
      } catch (err: any) {
        if (err.code === "EEXIST") {
          console.log(`[INFO] Lock exists, retrying in ${this.retryDelayMs}ms...`);
          await new Promise((r) => setTimeout(r, this.retryDelayMs));
        } else {
          throw err;
        }
      }
    }
    throw new Error("Failed to acquire lock after multiple retries");
  }

  private async releaseLock(): Promise<void> {
    try {
      await fs.unlink(this.lockFilePath);
      console.log("[INFO] Lock released");
    } catch (err: any) {
      if (err.code !== "ENOENT") {
        console.error("[ERROR] Failed to release lock:", err);
      }
    }
  }

  public async saveJobIdsToPersistenceAsync(jobs: Job[]): Promise<void> {
    await this.acquireLock();
    try {
        await this.ensureJobIdsFileExists();

        // Get existing job IDs
        const existingJobIds = await this.getJobIdsFromPersistenceAsync();

        // Extract incoming job IDs
        const newJobIds = jobs.map((job) => job.id);

        // Merge + deduplicate using Set
        const uniqueJobIds = Array.from(
        new Set([...existingJobIds, ...newJobIds])
        );

        // Atomic write
        const tempFile = this.filePath + "." + crypto.randomUUID() + ".tmp";
        await fs.writeFile(tempFile, JSON.stringify(uniqueJobIds, null, 2), "utf-8");
        await fs.rename(tempFile, this.filePath);

        console.log(`[INFO] Saved ${uniqueJobIds.length} job IDs to ${this.filePath}`);
    } catch (err) {
        console.error("[ERROR] Failed to save job IDs:", err);
        throw err;
    } finally {
        await this.releaseLock();
    }
   }

  public async getJobIdsFromPersistenceAsync(): Promise<string[]> {
    try {
        await this.ensureJobIdsFileExists();

        const data = await fs.readFile(this.filePath, "utf-8");

        const jobIds: string[] = JSON.parse(data);

        console.log(`[INFO] Loaded ${jobIds.length} job IDs from ${this.filePath}`);
        return jobIds;
    } catch (err: any) {
        if (err.code === "ENOENT") {
        console.log("[INFO] No job IDs file found, returning empty array");
        return [];
    }
        console.error("[ERROR] Failed to read job IDs:", err);
        throw err;
    }
  }

  private async ensureJobIdsFileExists(): Promise<void> {
    const dir = path.dirname(this.filePath);

    try {
        // Ensure directory exists
        await fs.mkdir(dir, { recursive: true });

        // Check if file exists
        await fs.access(this.filePath);
    } catch (err: any) {
        if (err.code === "ENOENT") {
        console.log("[INFO] Persistence file not found. Creating new file...");

        // Create empty JSON array file
        await fs.writeFile(this.filePath, "[]", "utf-8");
        } else {
        throw err;
        }
    }
  }
}