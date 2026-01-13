import { VideoRenderError } from '../base/VideoRenderError';
import { UnexpectedError } from '../types/UnexpectedError';

/**
 * Error handler utility for wrapping functions and ensuring consistent error handling
 */
export class ErrorHandler {
  /**
   * Wrap a function to ensure all thrown errors are VideoRenderError instances
   */
  static wrapFunction<T extends (...args: any[]) => any>(
    fn: T,
    context?: string
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args);

        // Handle async functions
        if (result instanceof Promise) {
          return result.catch((error: unknown) => {
            throw ErrorHandler.wrapError(error, context);
          });
        }

        return result;
      } catch (error: unknown) {
        throw ErrorHandler.wrapError(error, context);
      }
    }) as T;
  }

  /**
   * Wrap an async function to ensure all thrown errors are VideoRenderError instances
   */
  static wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: string
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (error: unknown) {
        throw ErrorHandler.wrapError(error, context);
      }
    }) as T;
  }

  /**
   * Wrap any error to ensure it's a VideoRenderError instance
   */
  static wrapError(error: unknown, context?: string): VideoRenderError {
    if (error instanceof VideoRenderError) {
      return error;
    }

    if (context && error instanceof Error) {
      return UnexpectedError.fromSystemError(context, error);
    }

    return UnexpectedError.fromUnknownError(error);
  }

  /**
   * Create a safe version of a function that catches and logs errors
   * Returns undefined if an error occurs
   */
  static safe<T extends (...args: any[]) => any>(
    fn: T,
    onError?: (error: VideoRenderError) => void
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>) => {
      try {
        const result = fn(...args);

        if (result instanceof Promise) {
          return result.catch((error: unknown) => {
            const wrappedError = ErrorHandler.wrapError(error);
            if (onError) {
              onError(wrappedError);
            }
            return undefined;
          }) as ReturnType<T>;
        }

        return result;
      } catch (error: unknown) {
        const wrappedError = ErrorHandler.wrapError(error);
        if (onError) {
          onError(wrappedError);
        }
        return undefined;
      }
    };
  }

  /**
   * Execute a function and return either the result or an error
   */
  static attempt<T>(
    fn: () => T
  ): { success: true; data: T } | { success: false; error: VideoRenderError } {
    try {
      const result = fn();
      return { success: true, data: result };
    } catch (error: unknown) {
      return { success: false, error: ErrorHandler.wrapError(error) };
    }
  }

  /**
   * Execute an async function and return either the result or an error
   */
  static async attemptAsync<T>(
    fn: () => Promise<T>
  ): Promise<
    { success: true; data: T } | { success: false; error: VideoRenderError }
  > {
    try {
      const result = await fn();
      return { success: true, data: result };
    } catch (error: unknown) {
      return { success: false, error: ErrorHandler.wrapError(error) };
    }
  }
}

/**
 * Decorator for wrapping class methods with error handling
 */
export function handleErrors(context?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);

        if (result instanceof Promise) {
          return result.catch((error: unknown) => {
            throw ErrorHandler.wrapError(
              error,
              context || `${target.constructor.name}.${propertyKey}`
            );
          });
        }

        return result;
      } catch (error: unknown) {
        throw ErrorHandler.wrapError(
          error,
          context || `${target.constructor.name}.${propertyKey}`
        );
      }
    };

    return descriptor;
  };
}

/**
 * Utility function to check if an error is recoverable
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof VideoRenderError) {
    return error.isRecoverable();
  }
  return false;
}

/**
 * Utility function to get error severity
 */
export function getErrorSeverity(error: unknown): string {
  if (error instanceof VideoRenderError) {
    return error.getSeverity();
  }
  return 'unknown';
}
