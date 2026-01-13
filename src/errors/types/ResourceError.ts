import { VideoRenderError, ErrorMetadata } from '../base/VideoRenderError';
import { ErrorCode, ERROR_CODES } from '../base/ErrorCodes';

/**
 * Error thrown when there are issues with resource loading (files, fonts, images, network)
 */
export class ResourceError extends VideoRenderError {
  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.RESOURCE_FILE_NOT_FOUND,
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
   * Create a ResourceError for file not found
   */
  static fileNotFound(filePath: string, cause?: Error): ResourceError {
    return new ResourceError(
      `File not found: ${filePath}. The specified file does not exist or is not accessible.`,
      ERROR_CODES.RESOURCE_FILE_NOT_FOUND,
      {
        suggestion: 'Check that the file path is correct and the file exists',
        context: { filePath },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a ResourceError for font download failures
   */
  static fontDownloadFailed(
    fontName: string,
    url?: string,
    cause?: Error
  ): ResourceError {
    return new ResourceError(
      `Failed to download font: ${fontName}. The font could not be retrieved from the source. ${cause}`,
      ERROR_CODES.RESOURCE_FONT_DOWNLOAD_FAILED,
      {
        suggestion:
          'Check your internet connection or try using a local font file',
        context: { fontName, url },
        severity: 'medium',
      },
      cause
    );
  }

  /**
   * Create a ResourceError for image loading failures
   */
  static imageLoadFailed(imagePath: string, cause?: Error): ResourceError {
    return new ResourceError(
      `Failed to load image: ${imagePath}. The image file is corrupted, unsupported, or inaccessible.`,
      ERROR_CODES.RESOURCE_IMAGE_LOAD_FAILED,
      {
        suggestion:
          'Verify the image file is valid and in a supported format (JPEG, PNG, GIF, WebP)',
        context: { imagePath },
        severity: 'medium',
      },
      cause
    );
  }

  /**
   * Create a ResourceError for network failures
   */
  static networkError(
    url: string,
    statusCode?: number,
    cause?: Error
  ): ResourceError {
    return new ResourceError(
      `Network error while accessing: ${url}. The resource could not be retrieved.`,
      ERROR_CODES.RESOURCE_NETWORK_ERROR,
      {
        suggestion:
          'Check your internet connection and verify the URL is accessible',
        context: { url, statusCode },
        severity: 'medium',
      },
      cause
    );
  }

  /**
   * Create a ResourceError for permission denied
   */
  static permissionDenied(
    path: string,
    operation: string,
    cause?: Error
  ): ResourceError {
    return new ResourceError(
      `Permission denied: Cannot ${operation} ${path}. Insufficient permissions to access the resource.`,
      ERROR_CODES.RESOURCE_PERMISSION_DENIED,
      {
        suggestion: 'Check file permissions or run with appropriate privileges',
        context: { path, operation },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a ResourceError for insufficient disk space
   */
  static insufficientDiskSpace(
    requiredSpace?: number,
    availableSpace?: number,
    cause?: Error
  ): ResourceError {
    return new ResourceError(
      'Insufficient disk space to complete the operation.',
      ERROR_CODES.RESOURCE_DISK_SPACE_INSUFFICIENT,
      {
        suggestion: 'Free up disk space or choose a different output location',
        context: {
          requiredSpaceMB: requiredSpace
            ? Math.round(requiredSpace / 1024 / 1024)
            : undefined,
          availableSpaceMB: availableSpace
            ? Math.round(availableSpace / 1024 / 1024)
            : undefined,
        },
        severity: 'critical',
      },
      cause
    );
  }
}
