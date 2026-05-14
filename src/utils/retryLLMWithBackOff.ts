export async function retryLLMWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 2000
): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    const isRetryable =
      err?.status === 429 || // rate limit
      err?.status >= 500 ||  // server errors
      err?.code === "ECONNRESET";

    if (isRetryable && retries > 0) {
      const attempt = 4 - retries;
      const delay = baseDelay * attempt + Math.random() * 500;

      console.warn(`Retrying in ${delay.toFixed(0)}ms... (${retries} retries left)`);
      await new Promise(res => setTimeout(res, delay));

      return retryLLMWithBackoff(fn, retries - 1, baseDelay);
    }

    throw err;
  }
}