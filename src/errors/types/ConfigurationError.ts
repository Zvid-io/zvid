import { VideoRenderError, ErrorMetadata } from '../base/VideoRenderError';
import { ErrorCode, ERROR_CODES } from '../base/ErrorCodes';

/**
 * Error thrown when there are issues with project configuration
 */
export class ConfigurationError extends VideoRenderError {
  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.CONFIG_MISSING_PROJECT_DATA,
    metadata: ErrorMetadata = {},
    cause?: Error
  ) {
    const enhancedMetadata: ErrorMetadata = {
      severity: 'high',
      recoverable: true,
      docsUrl: 'https://docs.zvid.io',
      ...metadata,
    };

    super(message, code, enhancedMetadata, cause);
  }

  /**
   * Create a ConfigurationError for missing duration
   */
  static invalidDuration(duration?: any, cause?: Error): ConfigurationError {
    return new ConfigurationError(
      'Project duration is invalid. Duration must be a positive number representing seconds.',
      ERROR_CODES.CONFIG_MISSING_DURATION,
      {
        suggestion:
          'Set project duration to a positive number (e.g., 30 for 30 seconds)',
        context: { providedDuration: duration },
        severity: 'critical',
      },
      cause
    );
  }

  /**
   * Create a ConfigurationError for invalid dimensions
   */
  static invalidDimensions(
    width?: any,
    height?: any,
    cause?: Error
  ): ConfigurationError {
    return new ConfigurationError(
      'Project dimensions are invalid. Width and height must be positive integers.',
      ERROR_CODES.CONFIG_INVALID_DIMENSIONS,
      {
        suggestion:
          'Set project width and height to positive integers (e.g., 1920, 1080)',
        context: { providedWidth: width, providedHeight: height },
        severity: 'critical',
      },
      cause
    );
  }

  /**
   * Create a ConfigurationError for invalid background color
   */
  static invalidBackground(bgColor?: any, cause?: Error): ConfigurationError {
    return new ConfigurationError(
      'Project background color is invalid. Must be a valid hex color.',
      ERROR_CODES.CONFIG_INVALID_BACKGROUND,
      {
        suggestion:
          'Set project backgroundColor to a valid hex color (e.g., "#ffffff" or "#000000")',
        context: { providedBgColor: bgColor },
        severity: 'medium',
      },
      cause
    );
  }

  /**
   * Create a ConfigurationError for missing project data
   */
  static missingProjectData(cause?: Error): ConfigurationError {
    return new ConfigurationError(
      'Project data is missing or malformed. The project object must contain valid properties.',
      ERROR_CODES.CONFIG_MISSING_PROJECT_DATA,
      {
        suggestion:
          'Ensure your project object has width, height, backgroundColor, visuals, and audios properties',
        severity: 'critical',
      },
      cause
    );
  }

  /**
   * Create a ConfigurationError for invalid frame rate
   */
  static invalidFrameRate(frameRate?: any, cause?: Error): ConfigurationError {
    return new ConfigurationError(
      'Invalid frame rate specified. Frame rate must be a positive number.',
      ERROR_CODES.CONFIG_INVALID_FRAME_RATE,
      {
        suggestion: 'Set frame rate to a standard value like 24, 30, or 60 fps',
        context: { providedFrameRate: frameRate },
        severity: 'medium',
      },
      cause
    );
  }

  /**
   * Create a ConfigurationError for invalid output format
   */
  static invalidOutputFormat(
    outputFormat?: any,
    supportedFormats?: string[],
    cause?: Error
  ): ConfigurationError {
    return new ConfigurationError(
      'Invalid output format specified. The format is not supported by FFmpeg.',
      ERROR_CODES.CONFIG_INVALID_OUTPUT_FORMAT,
      {
        suggestion: `Use a supported video format: ${
          supportedFormats?.join(', ') || 'mp4, mkv, avi, mov, webm'
        }`,
        context: { providedFormat: outputFormat, supportedFormats },
        severity: 'medium',
      },
      cause
    );
  }
}
