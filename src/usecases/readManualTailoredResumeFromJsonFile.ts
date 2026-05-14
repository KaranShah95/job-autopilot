import fs from "fs";
import path from "path";
import type { TailoredResumeResult } from "../domain/TailoredResumeResult.js";

export const readManualTailoredResumeFromJsonFile = async (
  jsonFilePath: string
): Promise<TailoredResumeResult> => {
  try {
    if (!fs.existsSync(jsonFilePath)) {
      throw new Error(`JSON file does not exist: ${jsonFilePath}`);
    }

    console.log(`[INFO] Reading Tailored Resume JSON from: ${jsonFilePath}`);

    const rawData = await fs.promises.readFile(jsonFilePath, "utf-8");
    const tailoredResume: TailoredResumeResult = JSON.parse(rawData);

    console.log(`[INFO] Loaded Tailored Resume`);

    return tailoredResume;

  } catch (error) {
    console.error("[ERROR] Failed to read Tailored Resume JSON:", error);
    throw error;
  }
};