import { ErrorCode } from './ErrorCodes';

/**
 * Metadata that can be attached to errors for enhanced debugging and user guidance
 */
export interface ErrorMetadata {
  /** Human-readable suggestion for fixing the error */
  suggestion?: string;
  /** Link to relevant documentation */
  docsUrl?: string;
  /** Additional context data related to the error */
  context?: Record<string, any>;
  /** Severity level of the error */
  severity?: 'low' | 'medium' | 'high' | 'critical';
  /** Whether this error is recoverable */
  recoverable?: boolean;
}

/**
 * Base error class for all Zvid.io library errors
 * Provides structured error information with codes, metadata, and cause chaining
 */
export class VideoRenderError extends Error {
  public readonly code: ErrorCode;
  public readonly metadata: ErrorMetadata;
  public readonly timestamp: Date;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: ErrorCode,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.metadata = {
      severity: 'medium',
      recoverable: false,
      ...metadata,
    };
    this.timestamp = new Date();
    this.cause = cause;

    // Maintain proper stack trace for V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // If there's a cause, append its stack trace
    if (cause && cause.stack) {
      this.stack = this.stack + '\nCaused by: ' + cause.stack;
    }
  }

  /**
   * Get a detailed error object suitable for logging or debugging
   */
  toDetailedObject(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      metadata: this.metadata,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause
        ? {
            name: this.cause.name,
            message: this.cause.message,
            stack: this.cause.stack,
          }
        : undefined,
    };
  }

  /**
   * Get a user-friendly error object (without sensitive debugging info)
   */
  toUserObject(): Record<string, any> {
    return {
      message: this.message,
      code: this.code,
      suggestion: this.metadata.suggestion,
      docsUrl: this.metadata.docsUrl,
      severity: this.metadata.severity,
      recoverable: this.metadata.recoverable,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Check if this error is of a specific category
   */
  isCategory(category: string): boolean {
    return this.code.includes(`_${category}_`);
  }

  /**
   * Check if this error is recoverable
   */
  isRecoverable(): boolean {
    return this.metadata.recoverable === true;
  }

  /**
   * Get the error severity level
   */
  getSeverity(): string {
    return this.metadata.severity || 'medium';
  }
}
