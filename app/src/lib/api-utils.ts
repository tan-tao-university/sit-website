/**
 * Custom error class for API errors
 * Provides structured error information for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Check if error is a network error (no response from server)
   */
  isNetworkError(): boolean {
    return !this.statusCode;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError(): boolean {
    return !!this.statusCode && this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError(): boolean {
    return !!this.statusCode && this.statusCode >= 500;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    // Retry on network errors and server errors, but not client errors
    return this.isNetworkError() || this.isServerError();
  }
}

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryDelayMultiplier?: number;
  shouldRetry?: (error: ApiError, attempt: number) => boolean;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryDelayMultiplier: 2, // Exponential backoff
  shouldRetry: (error: ApiError, attempt: number) => {
    return error.isRetryable() && attempt < 3;
  },
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch with retry logic
 * Implements exponential backoff for failed requests
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {},
): Promise<Response> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // If response is ok, return it
      if (response.ok) {
        return response;
      }

      // Create error from response
      const errorMessage = await response.text().catch(() => "Unknown error");
      lastError = new ApiError(
        errorMessage || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        url,
      );

      // Check if we should retry
      if (!config.shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      if (attempt < config.maxRetries) {
        const delay =
          config.retryDelay * Math.pow(config.retryDelayMultiplier, attempt);
        await sleep(delay);
      }
    } catch (error) {
      // Network error or other exception
      if (error instanceof ApiError) {
        lastError = error;
      } else {
        lastError = new ApiError(
          error instanceof Error ? error.message : "Network error",
          undefined,
          url,
          error,
        );
      }

      // Check if we should retry
      if (
        !config.shouldRetry(lastError, attempt) ||
        attempt === config.maxRetries
      ) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay =
        config.retryDelay * Math.pow(config.retryDelayMultiplier, attempt);
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new ApiError("Max retries exceeded", undefined, url);
}

/**
 * Request deduplication cache
 * Prevents multiple identical requests from being sent simultaneously
 */
class RequestCache {
  private cache = new Map<string, Promise<any>>();

  /**
   * Get or create a request
   * If a request with the same key is already in flight, return that promise
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5000,
  ): Promise<T> {
    // Check if request is already in flight
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Create new request
    const promise = fetcher()
      .then((result) => {
        // Remove from cache after TTL
        setTimeout(() => {
          this.cache.delete(key);
        }, ttl);
        return result;
      })
      .catch((error) => {
        // Remove from cache immediately on error
        this.cache.delete(key);
        throw error;
      });

    this.cache.set(key, promise);
    return promise;
  }

  /**
   * Clear all cached requests
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear a specific cached request
   */
  clearKey(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Global request cache instance
 */
export const requestCache = new RequestCache();

/**
 * Generate cache key for request deduplication
 */
export function generateCacheKey(url: string, options?: RequestInit): string {
  const method = options?.method || "GET";
  const body = options?.body ? JSON.stringify(options.body) : "";
  return `${method}:${url}:${body}`;
}
