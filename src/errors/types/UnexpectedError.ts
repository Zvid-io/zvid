import { VideoRenderError, ErrorMetadata } from '../base/VideoRenderError';
import { ErrorCode, ERROR_CODES } from '../base/ErrorCodes';

/**
 * Error thrown to wrap unknown or third-party errors
 * This ensures all errors thrown by the library are instances of VideoRenderError
 */
export class UnexpectedError extends VideoRenderError {
  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.UNEXPECTED_UNKNOWN_ERROR,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    const enhancedMetadata: ErrorMetadata = {
      severity: 'high',
      recoverable: false,
      docsUrl: 'https://docs.zvid.io',
      ...metadata,
    };

    super(message, code, enhancedMetadata, cause);
  }

  /**
   * Create an UnexpectedError for unknown errors
   */
  static fromUnknownError(originalError: unknown): UnexpectedError {
    let message = 'An unexpected error occurred';
    let cause: Error | undefined;

    if (originalError instanceof Error) {
      message = `Unexpected error: ${originalError.message}`;
      cause = originalError;
    } else if (typeof originalError === 'string') {
      message = `Unexpected error: ${originalError}`;
    } else if (originalError && typeof originalError === 'object') {
      message = `Unexpected error: ${JSON.stringify(originalError)}`;
    }

    return new UnexpectedError(
      message,
      ERROR_CODES.UNEXPECTED_UNKNOWN_ERROR,
      {
        suggestion:
          'This is an unexpected error. Please report this issue with the error details.',
        context: {
          originalErrorType: typeof originalError,
          originalErrorName:
            originalError instanceof Error ? originalError.name : undefined,
        },
        severity: 'critical',
      },
      cause
    );
  }

  /**
   * Create an UnexpectedError for third-party library errors
   */
  static fromThirdPartyError(
    libraryName: string,
    originalError: Error
  ): UnexpectedError {
    return new UnexpectedError(
      `Third-party library error from ${libraryName}: ${originalError.message}`,
      ERROR_CODES.UNEXPECTED_THIRD_PARTY_ERROR,
      {
        suggestion: `This error originated from the ${libraryName} library. Check the library documentation or update to the latest version.`,
        context: {
          libraryName,
          originalErrorName: originalError.name,
          originalErrorMessage: originalError.message,
        },
        severity: 'high',
      },
      originalError
    );
  }

  /**
   * Create an UnexpectedError for system-level errors
   */
  static fromSystemError(
    operation: string,
    originalError: Error
  ): UnexpectedError {
    return new UnexpectedError(
      `System error during ${operation}: ${originalError.message}`,
      ERROR_CODES.UNEXPECTED_SYSTEM_ERROR,
      {
        suggestion:
          'This appears to be a system-level error. Check system resources and permissions.',
        context: {
          operation,
          originalErrorName: originalError.name,
          originalErrorMessage: originalError.message,
        },
        severity: 'critical',
      },
      originalError
    );
  }

  /**
   * Wrap any error to ensure it's a VideoRenderError instance
   * If it's already a VideoRenderError, return it unchanged
   * Otherwise, wrap it in an UnexpectedError
   */
  static wrap(error: unknown): VideoRenderError {
    if (error instanceof VideoRenderError) {
      return error;
    }

    return UnexpectedError.fromUnknownError(error);
  }
}
