export declare class ResumeManager {
    private resumeText;
    /**
     * Loads a resume file into memory as plain text.
     * Supports .txt, .pdf, .docx, .pages (basic support via macOS command)
     * @param filePath Absolute or relative path to resume file
     */
    loadResume(filePath: string): Promise<void>;
    /**
     * Returns the loaded resume text
     */
    getResume(): string;
}
//# sourceMappingURL=ResumeManager.d.ts.map