import { VideoRenderError, ErrorMetadata } from '../base/VideoRenderError';
import { ErrorCode, ERROR_CODES } from '../base/ErrorCodes';

/**
 * Error thrown when there are issues with rendering operations (Canvas, Puppeteer, image generation)
 */
export class RenderingError extends VideoRenderError {
  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.RENDER_CANVAS_FAILED,
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
   * Create a RenderingError for Canvas failures
   */
  static canvasFailed(
    operation: string,
    context?: Record<string, any>,
    cause?: Error
  ): RenderingError {
    return new RenderingError(
      `Canvas rendering failed during ${operation}. The canvas operation could not be completed.`,
      ERROR_CODES.RENDER_CANVAS_FAILED,
      {
        suggestion:
          'Check that canvas dependencies are properly installed and the operation parameters are valid',
        context: { operation, ...context },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a RenderingError for Puppeteer failures
   */
  static puppeteerFailed(
    operation: string,
    url?: string,
    cause?: Error
  ): RenderingError {
    return new RenderingError(
      `Puppeteer operation failed: ${operation}. The browser automation could not be completed.`,
      ERROR_CODES.RENDER_PUPPETEER_FAILED,
      {
        suggestion:
          'Ensure Puppeteer is properly installed and the browser can be launched',
        context: { operation, url },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a RenderingError for SVG conversion failures
   */
  static svgConversionFailed(
    svgPath?: string,
    outputPath?: string,
    cause?: Error
  ): RenderingError {
    return new RenderingError(
      'SVG to PNG conversion failed. The SVG could not be converted to a raster image.',
      ERROR_CODES.RENDER_SVG_CONVERSION_FAILED,
      {
        suggestion:
          'Verify the SVG file is valid and the output directory is writable',
        context: { svgPath, outputPath },
        severity: 'medium',
        recoverable: true,
      },
      cause
    );
  }

  /**
   * Create a RenderingError for text generation failures
   */
  static textGenerationFailed(
    text?: string,
    fontFamily?: string,
    cause?: Error
  ): RenderingError {
    return new RenderingError(
      'Text rendering failed. The text could not be generated as an image.',
      ERROR_CODES.RENDER_TEXT_GENERATION_FAILED,
      {
        suggestion:
          'Check that the font is available and the text parameters are valid',
        context: { text: text?.substring(0, 100), fontFamily },
        severity: 'medium',
        recoverable: true,
      },
      cause
    );
  }

  /**
   * Create a RenderingError for image processing failures
   */
  static imageProcessingFailed(
    imagePath?: string,
    operation?: string,
    cause?: Error
  ): RenderingError {
    return new RenderingError(
      `Image processing failed during ${operation || 'unknown operation'}. The image could not be processed.`,
      ERROR_CODES.RENDER_IMAGE_PROCESSING_FAILED,
      {
        suggestion:
          'Verify the image file is valid and the processing parameters are correct',
        context: { imagePath, operation },
        severity: 'medium',
        recoverable: true,
      },
      cause
    );
  }

  /**
   * Create a RenderingError for browser timeout
   */
  static browserTimeout(
    operation: string,
    timeoutMs: number,
    cause?: Error
  ): RenderingError {
    return new RenderingError(
      `Browser operation timed out: ${operation}. The operation took longer than ${timeoutMs}ms to complete.`,
      ERROR_CODES.RENDER_BROWSER_TIMEOUT,
      {
        suggestion:
          'Increase the timeout value or optimize the operation for better performance',
        context: { operation, timeoutMs },
        severity: 'medium',
        recoverable: true,
      },
      cause
    );
  }
}
