# Job Autopilot 🚀

AI-powered job application automation system that tailors resumes and streamlines high-volume applications using LLMs and document intelligence.

---

## Overview

Job Autopilot automates repetitive parts of the job search process by:

- Parsing resumes and job descriptions
- Extracting ATS-relevant keywords
- Generating tailored resume variants using AI
- Managing application workflows
- Persisting application tracking data

The project combines AI workflow orchestration, document processing, and backend automation into a production-style TypeScript application.

---

## Features

- 🤖 AI-powered resume tailoring
- 📄 PDF and DOCX resume parsing
- 🧠 Job description analysis using OpenAI APIs
- 🗂 Persistent application tracking
- ⚡ Batch processing workflows
- 🛡 Structured AI validation using Zod
- 🔍 Keyword extraction for ATS optimization

---

## Tech Stack

| Category | Technologies |
|---|---|
| Language | TypeScript |
| Runtime | Node.js |
| AI | OpenAI API |
| Validation | Zod |
| Document Processing | pdf-parse, mammoth, docx |
| Parsing | xml2js, cheerio |
| Concurrency | p-limit |

---

## Workflow

```text
1. Load candidate profile
2. Parse target job description
3. Extract skills and ATS keywords
4. Generate tailored resume
5. Save optimized output
6. Track processed applications
```

---

## Project Structure

```bash
job-autopilot/
│
├── src/                     # Core application logic
├── tailored-resumes/        # Generated resumes
├── appConfig.json           # Runtime configuration
├── candidateProfileConfig.json
├── logs.txt
├── package.json
└── tsconfig.json
```

---

## Installation

```bash
git clone https://github.com/KaranShah95/job-autopilot.git

cd job-autopilot

npm install
```

---

## Running the Project

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

---

## Environment Variables

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key_here
```

---

## Engineering Highlights

This project demonstrates:

- AI workflow orchestration
- LLM integration patterns
- Type-safe backend engineering
- Document intelligence pipelines
- Structured prompt engineering
- Concurrent processing architecture
- Automation-focused system design

---

## Future Improvements

- LinkedIn / Greenhouse integrations
- Automated application submission
- Cover letter generation
- ATS scoring system
- Dashboard UI
- Multi-agent workflows

---

## Author

### Karan Shah

Software Engineer focused on:
- AI-powered automation
- Backend systems
- Workflow optimization
- Developer productivity tooling

GitHub: https://github.com/KaranShah95
