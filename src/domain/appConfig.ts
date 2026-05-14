import { z } from "zod";

export const AppConfigSchema = z.object({
  persistenceFilePath: z.string(),
  manualJobsJSONFilePath: z.string().optional(),
  manualTailoredResumeJSONFilePath: z.string().optional(),
  processManualJobsOnly: z.boolean().optional(),
  saveTailoredResumeOnly: z.boolean().optional(), 
  tailoredResumeOutputDirectory: z.string(),
});

export type appConfig = z.infer<typeof AppConfigSchema>;