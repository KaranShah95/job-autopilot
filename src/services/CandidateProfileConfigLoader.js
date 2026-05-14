import fs from "fs";
import path from "path";
import { CandidateProfileConfigSchema } from "../domain/CandidateProfileConfig.js";
export function loadCandidateProfileConfig(configPath) {
    try {
        console.log(`[INFO] Loading candidate profile from: ${configPath}`);
        if (!fs.existsSync(configPath)) {
            console.error(`[ERROR] Candidate profile config not found: ${configPath}`);
            return null;
        }
        const raw = fs.readFileSync(configPath, "utf-8");
        let json;
        try {
            json = JSON.parse(raw);
        }
        catch (err) {
            console.error(`[ERROR] Invalid JSON in ${configPath}:`, err);
            return null;
        }
        const parseResult = CandidateProfileConfigSchema.safeParse(json);
        if (!parseResult.success) {
            console.error(`[ERROR] Candidate profile validation failed:`, parseResult.error.format());
            return null;
        }
        // Normalize resume path
        parseResult.data.resumeFilePath = path.resolve(parseResult.data.resumeFilePath);
        console.log(`[INFO] Candidate profile loaded successfully for candidateId: ${parseResult.data.candidateId}`);
        return parseResult.data;
    }
    catch (err) {
        console.error(`[ERROR] Unexpected error loading candidate profile:`, err);
        return null;
    }
}
//# sourceMappingURL=CandidateProfileConfigLoader.js.map