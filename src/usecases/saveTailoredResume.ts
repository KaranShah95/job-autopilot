import type { TailoredResumeResult } from "../domain/TailoredResumeResult.js";
import type { ResumeManager } from "../services/ResumeManager.js";

type SavedTailoredResumePaths = {
  jsonPath: string;
  docxPath: string;
};

/**
 * Wrapper function to save a tailored resume in both JSON and DOCX formats.
 *
 * @param resumeManager Instance of ResumeManager
 * @param tailoredResumeResult Tailored resume to save
 * @param outputDir Directory where files will be saved
 * @returns Paths of saved JSON and DOCX files
 */
export const saveTailoredResume = async (
  resumeManager: ResumeManager,
  tailoredResumeResult: TailoredResumeResult,
  outputDir: string
): Promise<SavedTailoredResumePaths> => {
  try {
    console.log("[INFO] Saving tailored resume in JSON and DOCX formats...");

    const jsonPath = await saveTailoredResumeMetadataAsJSON(
      resumeManager,
      tailoredResumeResult,
      outputDir
    );

    const docxPath = await saveTailoredResumeAsDocx(
      resumeManager,
      tailoredResumeResult,
      outputDir
    );

    console.log("[INFO] Both JSON and DOCX resumes saved successfully.");

    return { jsonPath, docxPath };
  } catch (error) {
    console.error("[ERROR] Failed to save tailored resume in both formats:", error);
    throw error;
  }
};

export const saveTailoredResumeMetadataAsJSON = async (
  resumeManager: ResumeManager,
  tailoredResumeResult: TailoredResumeResult,
  outputDir: string
): Promise<string> => {
  try {
    console.log("[INFO] Saving tailored resume metadata...");

    // Save resume result
    const filePath = await resumeManager.saveTailoredResumeMetadataAsJSON(
      tailoredResumeResult,
      outputDir
    );

    console.log("\n🎯 Save operation complete");
    console.log(`📄 Saved: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error("[ERROR] Failed to save tailored resume metadata:", error);
    throw error;
  }
};

export const saveTailoredResumeAsDocx = async (
  resumeManager: ResumeManager,
  tailoredResumeResult: TailoredResumeResult,
  outputDir: string
): Promise<string> => {
  try {
    console.log("[INFO] Saving tailored resume as DOCX...");

    // Save single DOCX resume
    const filePath = await resumeManager.saveTailoredResumeAsDocx(
      tailoredResumeResult,
      outputDir
    );

    console.log("\n🎯 DOCX save complete");
    console.log(`📄 Saved: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error("[ERROR] Failed to save tailored DOCX resume:", error);
    throw error;
  }
};