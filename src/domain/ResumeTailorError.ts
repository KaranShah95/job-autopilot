export class ResumeTailorError extends Error {
  constructor(message: string, public jobId: string) {
    super(message);
    this.name = "ResumeTailorError";
  }
}

export class EmptyLLMResponseError extends ResumeTailorError {
  constructor(jobId: string) {
    super("Empty response from LLM", jobId);
    this.name = "EmptyLLMResponseError";
  }
}

export class InvalidLLMContentError extends ResumeTailorError {
  constructor(jobId: string) {
    super("Unable to normalize LLM content", jobId);
    this.name = "InvalidLLMContentError";
  }
}

export class ResumeValidationError extends ResumeTailorError {
  constructor(jobId: string, details: unknown) {
    super("Resume schema validation failed", jobId);
    this.name = "ResumeValidationError";
    (this as any).details = details;
  }
}