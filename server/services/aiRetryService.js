const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

/**
 * Executes an AI request and retries it when Groq
 * returns a rate-limit error (HTTP 429).
 *
 * Retry schedule:
 * Attempt 1 → immediately
 * Attempt 2 → wait 1 second
 * Attempt 3 → wait 2 seconds
 * Attempt 4 → wait 4 seconds
 *
 * If Groq provides a Retry-After header, we respect it.
 */
const generateWithRetry = async (
  fn,
  maxRetries = 2
) => {
  let lastError;

  for (
    let attempt = 0;
    attempt <= maxRetries;
    attempt++
  ) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Only retry rate-limit errors.
      // Other errors should immediately go to
      // your existing fallback logic.
      if (error.status !== 429) {
        throw error;
      }

      // No more retries available.
      if (attempt === maxRetries) {
        console.error(
          '[AI] Rate limit persisted after maximum retries.'
        );

        break;
      }

      /*
       * Groq may tell us exactly how long to wait.
       *
       * Example:
       * Retry-After: 2
       *
       * means wait 2 seconds.
       */
      const retryAfterHeader =
        error.headers?.['retry-after'];

      const retryAfterSeconds =
        Number(retryAfterHeader);

      let delay;

      if (
        Number.isFinite(retryAfterSeconds) &&
        retryAfterSeconds > 0
      ) {
        delay = retryAfterSeconds * 1000;
      } else {
        /*
         * Exponential backoff:
         *
         * attempt 0 → 1 second
         * attempt 1 → 2 seconds
         * attempt 2 → 4 seconds
         */
        delay =
          1000 * Math.pow(2, attempt);
      }

      console.warn(
        `[AI] Groq rate limited. ` +
        `Retry ${attempt + 1}/${maxRetries} ` +
        `after ${delay}ms.`
      );

      await sleep(delay);
    }
  }

  throw lastError;
};

module.exports = {
  generateWithRetry,
};