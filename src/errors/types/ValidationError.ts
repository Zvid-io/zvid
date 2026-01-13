import { VideoRenderError, ErrorMetadata } from '../base/VideoRenderError';
import { ErrorCode, ERROR_CODES } from '../base/ErrorCodes';

/**
 * Error thrown when there are issues with input validation
 */
export class ValidationError extends VideoRenderError {
  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    const enhancedMetadata: ErrorMetadata = {
      severity: 'medium',
      recoverable: true,
      docsUrl: 'https://docs.zvid.io',
      ...metadata,
    };

    super(message, code, enhancedMetadata, cause);
  }

  /**
   * Create a ValidationError for invalid project type
   */
  static invalidProjectType(
    providedType?: any,
    cause?: Error
  ): ValidationError {
    return new ValidationError(
      'Invalid project type. The project must be a valid ProjectType object.',
      ERROR_CODES.VALIDATION_INVALID_PROJECT_TYPE,
      {
        suggestion:
          'Ensure your project object matches the ProjectType interface',
        context: { providedType: typeof providedType },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a ValidationError for missing required field
   */
  static missingRequiredField(
    fieldName: string,
    objectType: string,
    cause?: Error
  ): ValidationError {
    return new ValidationError(
      `Missing required field: ${fieldName} in ${objectType}. This field is mandatory for proper operation.`,
      ERROR_CODES.VALIDATION_MISSING_REQUIRED_FIELD,
      {
        suggestion: `Add the required field "${fieldName}" to your ${objectType} object`,
        context: { fieldName, objectType },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a ValidationError for invalid item type
   */
  static invalidItemType(
    itemId: string,
    expectedTypes: string[],
    actualType?: string,
    cause?: Error
  ): ValidationError {
    return new ValidationError(
      `Invalid item type for item ${itemId}. Expected one of: ${expectedTypes.join(', ')}.`,
      ERROR_CODES.VALIDATION_INVALID_ITEM_TYPE,
      {
        suggestion: `Set the item type to one of the supported types: ${expectedTypes.join(', ')}`,
        context: { itemId, expectedTypes, actualType },
        severity: 'medium',
      },
      cause
    );
  }

  /**
   * Create a ValidationError for invalid time range
   */
  static invalidTimeRange(
    itemId: string,
    startTime?: number,
    endTime?: number,
    duration?: number,
    cause?: Error
  ): ValidationError {
    return new ValidationError(
      `Invalid time range for item ${itemId}. Start time must be less than end time and within project duration.`,
      ERROR_CODES.VALIDATION_INVALID_TIME_RANGE,
      {
        suggestion:
          'Ensure start time < end time and both are within the project duration',
        context: { itemId, startTime, endTime, projectDuration: duration },
        severity: 'medium',
      },
      cause
    );
  }

  /**
   * Create a ValidationError for invalid coordinates
   */
  static invalidCoordinates(
    itemId: string,
    x?: number,
    y?: number,
    width?: number,
    height?: number,
    cause?: Error
  ): ValidationError {
    return new ValidationError(
      `Invalid coordinates for item ${itemId}. Coordinates must be valid numbers within canvas bounds.`,
      ERROR_CODES.VALIDATION_INVALID_COORDINATES,
      {
        suggestion:
          'Ensure x, y, width, and height are positive numbers within canvas dimensions',
        context: { itemId, x, y, width, height },
        severity: 'medium',
      },
      cause
    );
  }

  /**
   * Create a ValidationError for invalid color format
   */
  static invalidColorFormat(
    color: string,
    expectedFormat: string,
    cause?: Error
  ): ValidationError {
    return new ValidationError(
      `Invalid color format: ${color}. Expected format: ${expectedFormat}.`,
      ERROR_CODES.VALIDATION_INVALID_COLOR_FORMAT,
      {
        suggestion: `Use the correct color format: ${expectedFormat} (e.g., "#ffffff" for hex)`,
        context: { providedColor: color, expectedFormat },
        severity: 'low',
      },
      cause
    );
  }
}
