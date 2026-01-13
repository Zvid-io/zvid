// Base error classes
export { VideoRenderError, ErrorMetadata } from './base/VideoRenderError';
export {
  ERROR_CODES,
  ErrorCode,
  ERROR_CATEGORIES,
  getErrorCategory,
  isErrorCategory,
} from './base/ErrorCodes';

// Specialized error types
export { ConfigurationError } from './types/ConfigurationError';
export { MediaProcessingError } from './types/MediaProcessingError';
export { ResourceError } from './types/ResourceError';
export { ValidationError } from './types/ValidationError';
export { RenderingError } from './types/RenderingError';
export { UnexpectedError } from './types/UnexpectedError';

// Utility functions and classes
export {
  ErrorHandler,
  handleErrors,
  isRecoverableError,
  getErrorSeverity,
} from './utils/errorHandler';
export { ErrorFactory } from './utils/errorFactory';

// Import classes for type guards
import { VideoRenderError } from './base/VideoRenderError';
import { ConfigurationError } from './types/ConfigurationError';
import { MediaProcessingError } from './types/MediaProcessingError';
import { ResourceError } from './types/ResourceError';
import { ValidationError } from './types/ValidationError';
import { RenderingError } from './types/RenderingError';
import { UnexpectedError } from './types/UnexpectedError';
import { ERROR_CATEGORIES, isErrorCategory } from './base/ErrorCodes';

// Type guards for error checking
export function isVideoRenderError(error: unknown): error is VideoRenderError {
  return error instanceof VideoRenderError;
}

export function isConfigurationError(
  error: unknown
): error is ConfigurationError {
  return error instanceof ConfigurationError;
}

export function isMediaProcessingError(
  error: unknown
): error is MediaProcessingError {
  return error instanceof MediaProcessingError;
}

export function isResourceError(error: unknown): error is ResourceError {
  return error instanceof ResourceError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isRenderingError(error: unknown): error is RenderingError {
  return error instanceof RenderingError;
}

export function isUnexpectedError(error: unknown): error is UnexpectedError {
  return error instanceof UnexpectedError;
}

/**
 * Check if an error belongs to a specific category
 */
export function isErrorOfCategory(
  error: unknown,
  category: keyof typeof ERROR_CATEGORIES
): boolean {
  if (error instanceof VideoRenderError) {
    return isErrorCategory(error.code, category);
  }
  return false;
}

/**
 * Get a user-friendly error message from any error
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (error instanceof VideoRenderError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred';
}

/**
 * Get error details for logging/debugging
 */
export function getErrorDetails(error: unknown): Record<string, any> {
  if (error instanceof VideoRenderError) {
    return error.toDetailedObject();
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    error: String(error),
    type: typeof error,
  };
}

/**
 * Get user-safe error information (without sensitive debugging data)
 */
export function getUserSafeErrorInfo(error: unknown): Record<string, any> {
  if (error instanceof VideoRenderError) {
    return error.toUserObject();
  }

  return {
    message: getUserFriendlyMessage(error),
    timestamp: new Date().toISOString(),
  };
}
