import fs from "fs";
import path from "path";
import { AppConfigSchema, type appConfig } from "../domain/appConfig.js";

export function loadAppConfig(configPath: string): appConfig | null {
  try {
    console.log(`[INFO] Loading app config from: ${configPath}`);

    if (!fs.existsSync(configPath)) {
      console.error(`[ERROR] app config not found: ${configPath}`);
      return null;
    }

    const raw = fs.readFileSync(configPath, "utf-8");
    let json: unknown;

    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.error(`[ERROR] Invalid JSON in ${configPath}:`, err);
      return null;
    }

    const parseResult = AppConfigSchema.safeParse(json);
    if (!parseResult.success) {
      console.error(`[ERROR] app config validation failed:`, parseResult.error.format());
      return null;
    }

    // Normalize resume path
    parseResult.data.persistenceFilePath = path.resolve(parseResult.data.persistenceFilePath);
    if (parseResult.data.manualJobsJSONFilePath){
      parseResult.data.manualJobsJSONFilePath = path.resolve(parseResult.data.manualJobsJSONFilePath);
    }
    if (parseResult.data.manualTailoredResumeJSONFilePath){
      parseResult.data.manualTailoredResumeJSONFilePath = path.resolve(parseResult.data.manualTailoredResumeJSONFilePath);
    }
    parseResult.data.tailoredResumeOutputDirectory = path.resolve(parseResult.data.tailoredResumeOutputDirectory);

    console.log(`[INFO] app config loaded successfully`);
    return parseResult.data;
  } catch (err) {
    console.error(`[ERROR] Unexpected error loading app config:`, err);
    return null;
  }
}