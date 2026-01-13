import { VideoRenderError } from '../base/VideoRenderError';
import { ConfigurationError } from '../types/ConfigurationError';
import { MediaProcessingError } from '../types/MediaProcessingError';
import { ResourceError } from '../types/ResourceError';
import { ValidationError } from '../types/ValidationError';
import { RenderingError } from '../types/RenderingError';
import { UnexpectedError } from '../types/UnexpectedError';
import { Project } from '../../types/items.type';

/**
 * Factory class for creating common errors with standardized messages and context
 */
export class ErrorFactory {
  /**
   * Validate project configuration and throw appropriate errors
   */
  static validateProject(project: any): asserts project is Project {
    if (!project) {
      throw ConfigurationError.missingProjectData();
    }

    const { width, height, backgroundColor, duration } = project;

    if (duration <= 0) {
      throw ConfigurationError.invalidDuration(duration);
    }

    if (width <= 0 || height <= 0) {
      throw ConfigurationError.invalidDimensions(width, height);
    }

    if (
      backgroundColor !== undefined &&
      !backgroundColor.match(/^#[0-9A-Fa-f]{6}$/)
    ) {
      throw ConfigurationError.invalidBackground(backgroundColor);
    }
  }

  /**
   * Create a file not found error with context
   */
  static fileNotFound(filePath: string, operation?: string): ResourceError {
    return ResourceError.fileNotFound(filePath);
  }

  /**
   * Create a network error with context
   */
  static networkError(
    url: string,
    statusCode?: number,
    operation?: string
  ): ResourceError {
    return ResourceError.networkError(url, statusCode);
  }

  /**
   * Create an FFmpeg error with context
   */
  static ffmpegError(
    command?: string,
    stderr?: string,
    operation?: string
  ): MediaProcessingError {
    return MediaProcessingError.ffmpegFailed(command, stderr);
  }

  /**
   * Create a Canvas error with context
   */
  static canvasError(
    operation: string,
    details?: Record<string, any>
  ): RenderingError {
    return RenderingError.canvasFailed(operation, details);
  }

  /**
   * Create a Puppeteer error with context
   */
  static puppeteerError(operation: string, url?: string): RenderingError {
    return RenderingError.puppeteerFailed(operation, url);
  }

  /**
   * Create a validation error for missing required fields
   */
  static missingField(fieldName: string, objectType: string): ValidationError {
    return ValidationError.missingRequiredField(fieldName, objectType);
  }

  /**
   * Create a validation error for invalid item types
   */
  static invalidItemType(
    itemId: string,
    expectedTypes: string[],
    actualType?: string
  ): ValidationError {
    return ValidationError.invalidItemType(itemId, expectedTypes, actualType);
  }

  /**
   * Create a font download error
   */
  static fontDownloadError(
    fontName: string,
    url?: string,
    cause?: Error
  ): ResourceError {
    return ResourceError.fontDownloadFailed(fontName, url, cause);
  }

  /**
   * Create an image processing error
   */
  static imageProcessingError(
    imagePath: string,
    operation: string,
    cause?: Error
  ): RenderingError {
    return RenderingError.imageProcessingFailed(imagePath, operation, cause);
  }

  /**
   * Create a text generation error
   */
  static textGenerationError(
    text: string,
    fontFamily?: string,
    cause?: Error
  ): RenderingError {
    return RenderingError.textGenerationFailed(text, fontFamily, cause);
  }

  /**
   * Create an SVG conversion error
   */
  static svgConversionError(
    svgPath: string,
    outputPath?: string,
    cause?: Error
  ): RenderingError {
    return RenderingError.svgConversionFailed(svgPath, outputPath, cause);
  }

  /**
   * Create a metadata extraction error
   */
  static metadataError(filePath: string, cause?: Error): MediaProcessingError {
    return MediaProcessingError.metadataExtractionFailed(filePath, cause);
  }

  /**
   * Create a browser timeout error
   */
  static browserTimeoutError(
    operation: string,
    timeoutMs: number
  ): RenderingError {
    return RenderingError.browserTimeout(operation, timeoutMs);
  }

  /**
   * Create a permission denied error
   */
  static permissionError(path: string, operation: string): ResourceError {
    return ResourceError.permissionDenied(path, operation);
  }

  /**
   * Create a disk space error
   */
  static diskSpaceError(
    requiredSpace?: number,
    availableSpace?: number
  ): ResourceError {
    return ResourceError.insufficientDiskSpace(requiredSpace, availableSpace);
  }

  /**
   * Wrap a third-party library error
   */
  static wrapThirdPartyError(
    libraryName: string,
    originalError: Error
  ): UnexpectedError {
    return UnexpectedError.fromThirdPartyError(libraryName, originalError);
  }

  /**
   * Wrap a system error
   */
  static wrapSystemError(
    operation: string,
    originalError: Error
  ): UnexpectedError {
    return UnexpectedError.fromSystemError(operation, originalError);
  }

  /**
   * Wrap any unknown error
   */
  static wrapUnknownError(originalError: unknown): UnexpectedError {
    return UnexpectedError.fromUnknownError(originalError);
  }

  /**
   * Create an error based on error type detection
   */
  static createFromError(error: unknown, context?: string): VideoRenderError {
    if (error instanceof VideoRenderError) {
      return error;
    }

    if (error instanceof Error) {
      // Try to detect error type based on message or name
      const message = error.message.toLowerCase();
      const name = error.name.toLowerCase();

      if (message.includes('enoent') || message.includes('file not found')) {
        return ResourceError.fileNotFound(context || 'unknown file');
      }

      if (message.includes('eacces') || message.includes('permission denied')) {
        return ResourceError.permissionDenied(
          context || 'unknown path',
          'access'
        );
      }

      if (message.includes('enospc') || message.includes('no space left')) {
        return ResourceError.insufficientDiskSpace();
      }

      if (
        message.includes('network') ||
        message.includes('fetch') ||
        name.includes('fetch')
      ) {
        return ResourceError.networkError(context || 'unknown url');
      }

      if (message.includes('ffmpeg') || context?.includes('ffmpeg')) {
        return MediaProcessingError.ffmpegFailed(undefined, error.message);
      }

      if (message.includes('canvas') || context?.includes('canvas')) {
        return RenderingError.canvasFailed(context || 'unknown operation');
      }

      if (message.includes('puppeteer') || context?.includes('puppeteer')) {
        return RenderingError.puppeteerFailed(context || 'unknown operation');
      }

      // Default to system error if we have context
      if (context) {
        return UnexpectedError.fromSystemError(context, error);
      }
    }

    return UnexpectedError.fromUnknownError(error);
  }
}
