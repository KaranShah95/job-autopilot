import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
export class ResumeManager {
    resumeText = "";
    /**
     * Loads a resume file into memory as plain text.
     * Supports .txt, .pdf, .docx, .pages (basic support via macOS command)
     * @param filePath Absolute or relative path to resume file
     */
    async loadResume(filePath) {
        try {
            console.log(`[INFO] Loading resume from: ${filePath}`);
            if (!fs.existsSync(filePath)) {
                console.error(`[ERROR] Resume file not found: ${filePath}`);
                throw new Error(`Resume file does not exist: ${filePath}`);
            }
            const ext = path.extname(filePath).toLowerCase();
            switch (ext) {
                case ".txt":
                    this.resumeText = fs.readFileSync(filePath, "utf-8");
                    console.log("[INFO] Loaded .txt resume successfully.");
                    break;
                case ".pdf":
                    console.log("[INFO] Parsing PDF resume...");
                    const dataBuffer = fs.readFileSync(filePath);
                    const pdfData = await pdfParse(dataBuffer);
                    this.resumeText = pdfData.text;
                    console.log("[INFO] PDF resume parsed successfully.");
                    break;
                case ".docx":
                    console.log("[INFO] Extracting text from DOCX resume...");
                    try {
                        const result = await mammoth.extractRawText({ path: filePath });
                        this.resumeText = result.value;
                        console.log("[INFO] DOCX resume extracted successfully.");
                    }
                    catch (err) {
                        console.error("[ERROR] Failed to parse DOCX file:", err);
                        throw err;
                    }
                    break;
                case ".pages":
                    console.log("[INFO] Extracting text from .pages resume (macOS only)...");
                    try {
                        const output = execSync(`textutil -convert txt -stdout "${filePath}"`, {
                            encoding: "utf-8",
                        });
                        this.resumeText = output;
                        console.log("[INFO] .pages resume extracted successfully.");
                    }
                    catch (err) {
                        console.error("[ERROR] Failed to extract text from .pages file:", err);
                        throw err;
                    }
                    break;
                default:
                    console.error(`[ERROR] Unsupported resume file type: ${ext}`);
                    throw new Error(`Unsupported resume file type: ${ext}`);
            }
            // Normalize whitespace
            this.resumeText = this.resumeText.replace(/\s+/g, " ").trim();
            console.log(`[INFO] Resume loaded and normalized. Length: ${this.resumeText.length} chars`);
        }
        catch (err) {
            console.error("[ERROR] Unexpected error loading resume:", err);
            throw err;
        }
    }
    /**
     * Returns the loaded resume text
     */
    getResume() {
        if (!this.resumeText) {
            console.error("[ERROR] Resume not loaded yet. Call loadResume() first.");
            throw new Error("Resume not loaded yet. Call loadResume() first.");
        }
        console.log(`[INFO] Returning resume text. Length: ${this.resumeText.length} chars`);
        return this.resumeText;
    }
}
//# sourceMappingURL=ResumeManager.js.map