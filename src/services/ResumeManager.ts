import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import type { TailoredResumeResult } from "../domain/TailoredResumeResult.js";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, TabStopType } from "docx";

export class ResumeManager {
  private resumeText: string = "";

  /**
   * Loads a resume file into memory as plain text.
   * Supports .txt, .pdf, .docx, .pages (basic support via macOS command)
   * @param filePath Absolute or relative path to resume file
   */
  async loadResume(filePath: string): Promise<void> {
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
          } catch (err) {
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
          } catch (err) {
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
    } catch (err) {
      console.error("[ERROR] Unexpected error loading resume:", err);
      throw err;
    }
  }

  /**
   * Returns the loaded resume text
   */
  getResume(): string {
    if (!this.resumeText) {
      console.error("[ERROR] Resume not loaded yet. Call loadResume() first.");
      throw new Error("Resume not loaded yet. Call loadResume() first.");
    }
    console.log(`[INFO] Returning resume text. Length: ${this.resumeText.length} chars`);
    return this.resumeText;
  }

    /**
   * Saves a tailored resume (ResumeSection) as a JSON file.
   *
   * Each resume is stored separately for:
   * - debugging
   * - auditability
   * - UI rendering
   * - future re-ranking / comparison
   *
   * @param resume Tailored ResumeSection object
   * @param outputDir Directory where JSON files will be stored
   * @param fileName Optional custom file name (fallback: timestamp-based)
   */
   saveTailoredResumeMetadataAsJSON(
    result: TailoredResumeResult,
    outputDir: string
   ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        console.log("[INFO] Saving tailored resume...");

        const rawCompany = result.job.company.name ?? "unknown";
        const rawCountry = result.job.location?.country ?? "unknown";

        // sanitize company
        const safeCompanyFolder = rawCompany
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_|_$/g, "")
          .replace(/_+/g, "_");

        // sanitize country
        const safeCountryFolder = rawCountry
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_|_$/g, "")
          .replace(/_+/g, "_");

        // build paths
        const companyDir = path.join(outputDir, safeCompanyFolder);
        const countryDir = path.join(companyDir, safeCountryFolder);

        // ensure directories exist
        if (!fs.existsSync(countryDir)) {
          console.log(`[INFO] Creating folder: ${countryDir}`);
          fs.mkdirSync(countryDir, { recursive: true });
        }

        // filename
        const safeFileName = `${result.job.title}_${result.job.id}`
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/gi, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");

        // final path (now inside country folder)
        const fullPath = path.join(countryDir, `${safeFileName}.json`);

        const payload: TailoredResumeResult = {
          job: result.job,
          jobScore: result.jobScore,
          resume: result.resume,
          createdAt: result.createdAt,
        };

        // ✅ async write (non-blocking)
        fs.writeFile(fullPath, JSON.stringify(payload, null, 2), "utf-8", (err) => {
          if (err) {
            console.error("[ERROR] Failed to save resume:", err);
            return reject(err);
          }

          console.log(`[INFO] Saved tailored resume → ${fullPath}`);
          resolve(fullPath);
        });
      } catch (err) {
        console.error("[ERROR] Unexpected error saving resume:", err);
        reject(err);
      }
    });
  }

/**
 * Saves a tailored resume as a DOCX file
 * - Keeps full content (no trimming)
 * - Matches JSON output folder structure
 */
  saveTailoredResumeAsDocx(
    result: TailoredResumeResult,
    outputDir: string
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("[INFO] Saving Harvard-style resume...");

        const rawCompany = result.job.company.name ?? "unknown";
        const rawCountry = result.job.location?.country ?? "unknown";

        // sanitize company
        const safeCompanyFolder = rawCompany
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_|_$/g, "")
          .replace(/_+/g, "_");

        // sanitize country
        const safeCountryFolder = rawCountry
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_|_$/g, "")
          .replace(/_+/g, "_");

        // build paths
        const companyDir = path.join(outputDir, safeCompanyFolder);
        const countryDir = path.join(companyDir, safeCountryFolder);

        // ensure directories exist
        if (!fs.existsSync(countryDir)) {
          console.log(`[INFO] Creating folder: ${countryDir}`);
          fs.mkdirSync(countryDir, { recursive: true });
        }

        // filename
        const safeFileName = `${result.job.title}_${result.job.id}`
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/gi, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");

        // final path (now inside country folder)
        const fullPath = path.join(countryDir, `${safeFileName}.docx`);

        const resume = result.resume;

        // ================================
        // STYLE CONSTANTS
        // ================================
        const FONT = "Avenir Next";

        const NAME = 30; //28
        const BODY = 20; //15
        const HEADING = 22; //16

        const BLACK = "000000";

        const SKILLS_SPACE = 80; //20
        const PARA_SPACE = 120; //40
        const BLOCK_SPACE = 160; //60
        const SECTION_SPACE = 260; //110

        // ================================
        // HELPERS
        // ================================
        const clean = (text: string) =>
        text
          .replace(/\*\*(.*?)\*\*/g, "$1") // removes **bold**
          .replace(/\*([^*]+)\*/g, "$1")   // removes *italic* (optional but useful)
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1") // markdown links
          .replace(/mailto:/gi, "");

        const textRun = (text: string, bold = false) =>
          new TextRun({
            text: clean(text),
            bold,
            size: BODY,
            font: FONT,
            color: BLACK,
          });

        const paragraph = (text: string) =>
          new Paragraph({
            children: [textRun(text)],
            spacing: { after: PARA_SPACE },
          });

        const bullet = (text: string) =>
          new Paragraph({
            children: [textRun(text)],
            bullet: { level: 0 },
            spacing: { after: 60 }, //20
          });

        const heading = (text: string) =>
          new Paragraph({
            children: [
              new TextRun({
                text: text.toUpperCase(),
                bold: true,
                size: HEADING,
                font: FONT,
                color: BLACK,
              }),
            ],
            spacing: { before: SECTION_SPACE, after: BLOCK_SPACE },
          });

          const roleHeading = (heading: string) =>
          new Paragraph({
            children: [
              new TextRun({
                text: heading,
                bold: true,
                size: BODY,
                font: FONT,
              })
            ],
            spacing: { after: 60 }, //20
          });

        const roleHeadingWithDate = (left: string, right: string) =>
          new Paragraph({
            children: [
              new TextRun({
                text: left,
                bold: true,
                size: BODY,
                font: FONT,
              }),
              new TextRun({ text: "    " }),
              new TextRun({
                text: right,
                size: BODY,
                font: FONT,
              }),
            ],
            spacing: { after: 60 }, //20
          });

        // ================================
        // DOCUMENT BODY
        // ================================
        const children: Paragraph[] = [];

        // NAME
        if (resume.contact?.name) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: resume.contact.name,
                  bold: true,
                  size: NAME,
                  font: FONT,
                  color: BLACK,
                }),
              ],
              spacing: { after: 120 }, //40
            })
          );
        }

        // CONTACT
        const contactLine = [
          resume.contact?.email,
          resume.contact?.phone,
          resume.contact?.location,
          resume.contact?.linkedin,
        ]
          .filter(Boolean)
          .join(" | ");

        if (contactLine) {
          children.push(paragraph(contactLine));
        }
        children.push(
                new Paragraph({
                  text: "",
                  spacing: { after: BLOCK_SPACE },
                })
          );
        // ================================
        // SUMMARY
        // ================================
        if (resume.summary) {
          children.push(heading("Summary"));
          children.push(paragraph(resume.summary));
          children.push(
                new Paragraph({
                  text: "",
                  spacing: { after: BLOCK_SPACE },
                })
          );
        }

        // ================================
        // SKILLS
        // ================================
        if (resume.skills) {
          children.push(heading("Skills"));

          resume.skills.categories.forEach((cat) => {
            if (cat.category) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${cat.category}: `,
                      bold: true,
                      size: BODY,
                      font: FONT,
                    }),
                    new TextRun({
                      text: clean(cat.skills.join(", ")),
                      size: BODY,
                      font: FONT,
                    }),
                  ],
                })
              );
              children.push(
                new Paragraph({
                  text: "",
                  spacing: { after: SKILLS_SPACE },
                })
              );
            }
          })
          children.push(
                new Paragraph({
                  text: "",
                  spacing: { after: BLOCK_SPACE },
                })
          );
        }

        // ================================
        // EXPERIENCE
        // ================================
        if (resume.experience?.length) {
          children.push(heading("Experience"));

          resume.experience.forEach((exp) => {
            children.push(
              roleHeadingWithDate(
                `${exp.title}, ${exp.company}`,
                exp.duration
              )
            );

            if (exp.location) {
              children.push(paragraph(exp.location));
            }

            exp.bullets.forEach((b) => children.push(bullet(b)));

            children.push(
              new Paragraph({
                text: "",
                spacing: { after: BLOCK_SPACE },
              })
            );
          });
        }

        // ================================
        // KEY ACHIEVEMENTS
        // ================================
        if (resume.keyAchievements?.length) {
          children.push(heading("Key Technical Achievements"));

          resume.keyAchievements.forEach((b) => {
            children.push(bullet(b));
          });
          children.push(
              new Paragraph({
                text: "",
                spacing: { after: BLOCK_SPACE },
              })
          );
        }

        // ================================
        // PROJECTS
        // ================================
        if (resume.projects?.length) {
          children.push(heading("Projects"));

          resume.projects.forEach((p) => {
            children.push(roleHeading(`${p.name}`));

            children.push(paragraph(p.description));

            p.bullets?.forEach((b) => children.push(bullet(b)));

            children.push(
              new Paragraph({
                text: "",
                spacing: { after: BLOCK_SPACE },
              })
            );
          });
        }

        // ================================
        // EDUCATION
        // ================================
        if (resume.education?.length) {
          children.push(heading("Education"));

          resume.education.forEach((edu) => {
            const location = [edu.city, edu.state, edu.country]
              .filter(Boolean)
              .join(", ");

            children.push(
              paragraph(`${edu.degree} | ${edu.year ?? ""}`)
            );

            children.push(
              paragraph(`${edu.institution}, ${location}`)
            );

            if (edu.gpa) {
              children.push(paragraph(`GPA: ${edu.gpa}`));
            }
            
            children.push(
              new Paragraph({
                text: "",
                spacing: { after: BLOCK_SPACE },
              })
            );
          }
        );
        }

        // ================================
        // BUILD DOC
        // ================================
        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  margin: {
                    top: 500,
                    bottom: 500,
                    left: 720,
                    right: 720,
                  },
                },
              },
              children,
            },
          ],
        });

        const buffer = await Packer.toBuffer(doc);
        fs.writeFileSync(fullPath, buffer);

        console.log(`[INFO] Saved → ${fullPath}`);
        resolve(fullPath);
      } catch (err) {
        console.error("[ERROR]", err);
        reject(err);
      }
    });
  }




  //Mahima's Font Size
  async saveTailoredResumeAsDocx_Mahima(
    result: TailoredResumeResult,
    outputDir: string
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("[INFO] Saving Harvard-style resume...");

        const rawCompany = result.job.company.name ?? "unknown";
        const rawCountry = result.job.location?.country ?? "unknown";

        // sanitize company
        const safeCompanyFolder = rawCompany
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_|_$/g, "")
          .replace(/_+/g, "_");

        // sanitize country
        const safeCountryFolder = rawCountry
          .toLowerCase()
          .replace(/[^a-z0-9]+/gi, "_")
          .replace(/^_|_$/g, "")
          .replace(/_+/g, "_");

        // build paths
        const companyDir = path.join(outputDir, safeCompanyFolder);
        const countryDir = path.join(companyDir, safeCountryFolder);

        // ensure directories exist
        if (!fs.existsSync(countryDir)) {
          console.log(`[INFO] Creating folder: ${countryDir}`);
          fs.mkdirSync(countryDir, { recursive: true });
        }

        // filename
        const safeFileName = `${result.job.title}_${result.job.id}`
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/gi, "_")
          .replace(/_+/g, "_")
          .replace(/^_|_$/g, "");

        // final path
        const fullPath = path.join(countryDir, `${safeFileName}.docx`);

        const resume = result.resume;

        // ================================
        // STYLE CONSTANTS
        // ================================
        const FONT = "Avenir Next";

        // DOCX sizes are HALF-POINTS
        const NAME = 24;       // 12 pt
        const CONTACT = 16;    // 8 pt
        const BODY = 14;       // 7 pt
        const HEADING = 16;    // 8 pt

        const BLACK = "000000";

        // spacing values are in TWIPS
        const LINE_SPACING = 220;

        const BULLET_SPACE = 30;
        const PARA_SPACE = 50;
        const BLOCK_SPACE = 90;
        const SECTION_SPACE = 140;

        const NAME_SPACE = 40;
        const CONTACT_SPACE = 80;

        // ================================
        // HELPERS
        // ================================
        const clean = (text: string) =>
          text
            .replace(/\*\*(.*?)\*\*/g, "$1")
            .replace(/\*([^*]+)\*/g, "$1")
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
            .replace(/mailto:/gi, "");

        const textRun = (text: string, bold = false) =>
          new TextRun({
            text: clean(text),
            bold,
            size: BODY,
            font: FONT,
            color: BLACK,
          });

        const paragraph = (text: string) =>
          new Paragraph({
            children: [textRun(text)],
            spacing: {
              after: PARA_SPACE,
              line: LINE_SPACING,
            },
          });

        const bullet = (text: string) =>
          new Paragraph({
            children: [textRun(text)],
            bullet: { level: 0 },
            spacing: {
              after: BULLET_SPACE,
              line: LINE_SPACING,
            },
            indent: {
              left: 360,
              hanging: 180,
            },
          });

        const heading = (text: string) =>
          new Paragraph({
            children: [
              new TextRun({
                text: text.toUpperCase(),
                bold: true,
                size: HEADING,
                font: FONT,
                color: BLACK,
              }),
            ],
            spacing: {
              before: SECTION_SPACE,
              after: BLOCK_SPACE,
              line: LINE_SPACING,
            },
          });

        const roleHeading = (heading: string) =>
          new Paragraph({
            children: [
              new TextRun({
                text: heading,
                bold: true,
                size: BODY,
                font: FONT,
              }),
            ],
            spacing: {
              after: 30,
              line: LINE_SPACING,
            },
          });

        const roleHeadingWithDate = (left: string, right: string) =>
          new Paragraph({
            children: [
              new TextRun({
                text: left,
                bold: true,
                size: BODY,
                font: FONT,
              }),
              new TextRun({
                text: "    ",
              }),
              new TextRun({
                text: right,
                size: BODY,
                font: FONT,
              }),
            ],
            spacing: {
              after: 30,
              line: LINE_SPACING,
            },
          });

        // ================================
        // DOCUMENT BODY
        // ================================
        const children: Paragraph[] = [];

        // ================================
        // NAME
        // ================================
        if (resume.contact?.name) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: resume.contact.name,
                  bold: true,
                  size: NAME,
                  font: FONT,
                  color: BLACK,
                }),
              ],
              spacing: {
                after: NAME_SPACE,
                line: LINE_SPACING,
              },
            })
          );
        }

        // ================================
        // CONTACT
        // ================================
        const contactLine = [
          resume.contact?.email,
          resume.contact?.phone,
          resume.contact?.location,
          resume.contact?.linkedin,
        ]
          .filter(Boolean)
          .join(" | ");

        if (contactLine) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: clean(contactLine),
                  size: CONTACT,
                  font: FONT,
                  color: BLACK,
                }),
              ],
              spacing: {
                after: CONTACT_SPACE,
                line: LINE_SPACING,
              },
            })
          );
        }

        // ================================
        // SUMMARY
        // ================================
        if (resume.summary) {
          children.push(heading("Summary"));
          children.push(paragraph(resume.summary));
        }

        // ================================
        // SKILLS
        // ================================
        if (resume.skills) {
          children.push(heading("Skills"));

          resume.skills.categories.forEach((cat) => {
            if (cat.category) {
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${cat.category}: `,
                      bold: true,
                      size: BODY,
                      font: FONT,
                    }),
                    new TextRun({
                      text: clean(cat.skills.join(", ")),
                      size: BODY,
                      font: FONT,
                    }),
                  ],
                  spacing: {
                    after: PARA_SPACE,
                    line: LINE_SPACING,
                  },
                })
              );
            }
          });
        }

        // ================================
        // EXPERIENCE
        // ================================
        if (resume.experience?.length) {
          children.push(heading("Experience"));

          resume.experience.forEach((exp) => {
            children.push(
              roleHeadingWithDate(
                `${exp.title}, ${exp.company}`,
                exp.duration
              )
            );

            if (exp.location) {
              children.push(paragraph(exp.location));
            }

            exp.bullets.forEach((b) => {
              children.push(bullet(b));
            });

            children.push(
              new Paragraph({
                text: "",
                spacing: {
                  after: BLOCK_SPACE,
                },
              })
            );
          });
        }

        // ================================
        // KEY ACHIEVEMENTS
        // ================================
        // if (resume.keyAchievements?.length) {
        //   children.push(heading("Key Technical Achievements"));

        //   resume.keyAchievements.forEach((b) => {
        //     children.push(bullet(b));
        //   });
        // }

        // ================================
        // PROJECTS
        // ================================
        if (resume.projects?.length) {
          children.push(heading("Projects"));

          resume.projects.forEach((p) => {
            children.push(roleHeading(p.name));

            children.push(paragraph(p.description));

            p.bullets?.forEach((b) => {
              children.push(bullet(b));
            });

            children.push(
              new Paragraph({
                text: "",
                spacing: {
                  after: BLOCK_SPACE,
                },
              })
            );
          });
        }

        // ================================
        // EDUCATION
        // ================================
        if (resume.education?.length) {
          children.push(heading("Education"));

          resume.education.forEach((edu) => {
            const location = [edu.city, edu.state, edu.country]
              .filter(Boolean)
              .join(", ");

            children.push(
              paragraph(`${edu.degree} | ${edu.year ?? ""}`)
            );

            children.push(
              paragraph(`${edu.institution}, ${location}`)
            );

            if (edu.gpa) {
              children.push(paragraph(`GPA: ${edu.gpa}`));
            }

            children.push(
              new Paragraph({
                text: "",
                spacing: {
                  after: BLOCK_SPACE,
                },
              })
            );
          });
        }

        // ================================
        // BUILD DOC
        // ================================
        const doc = new Document({
          sections: [
            {
              properties: {
                page: {
                  margin: {
                    top: 500,
                    bottom: 500,
                    left: 720,
                    right: 720,
                  },
                },
              },
              children,
            },
          ],
        });

        const buffer = await Packer.toBuffer(doc);

        fs.writeFileSync(fullPath, buffer);

        console.log(`[INFO] Saved → ${fullPath}`);

        resolve(fullPath);
      } catch (err) {
        console.error("[ERROR]", err);
        reject(err);
      }
    });
  }

}