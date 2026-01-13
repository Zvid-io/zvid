import { VideoRenderError, ErrorMetadata } from '../base/VideoRenderError';
import { ErrorCode, ERROR_CODES } from '../base/ErrorCodes';

/**
 * Error thrown when there are issues with media processing (FFmpeg, video/audio)
 */
export class MediaProcessingError extends VideoRenderError {
  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.MEDIA_FFMPEG_FAILED,
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
   * Create a MediaProcessingError for FFmpeg failures
   */
  static ffmpegFailed(
    command?: string,
    stderr?: string,
    cause?: Error
  ): MediaProcessingError {
    return new MediaProcessingError(
      'FFmpeg processing failed. The video encoding or filtering operation could not be completed.',
      ERROR_CODES.MEDIA_FFMPEG_FAILED,
      {
        suggestion:
          'Check that your input files are valid and FFmpeg is properly installed',
        context: {
          command: command?.substring(0, 200), // Truncate long commands
          stderr: stderr?.substring(0, 500), // Truncate long stderr
        },
        severity: 'critical',
      },
      cause
    );
  }

  /**
   * Create a MediaProcessingError for invalid video format
   */
  static invalidVideoFormat(
    filePath?: string,
    format?: string,
    cause?: Error
  ): MediaProcessingError {
    return new MediaProcessingError(
      'Invalid video format detected. The video file format is not supported or corrupted.',
      ERROR_CODES.MEDIA_INVALID_VIDEO_FORMAT,
      {
        suggestion: 'Use supported video formats like MP4, MOV, AVI, or WebM',
        context: { filePath, detectedFormat: format },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a MediaProcessingError for invalid audio format
   */
  static invalidAudioFormat(
    filePath?: string,
    format?: string,
    cause?: Error
  ): MediaProcessingError {
    return new MediaProcessingError(
      'Invalid audio format detected. The audio file format is not supported or corrupted.',
      ERROR_CODES.MEDIA_INVALID_AUDIO_FORMAT,
      {
        suggestion: 'Use supported audio formats like MP3, WAV, AAC, or OGG',
        context: { filePath, detectedFormat: format },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a MediaProcessingError for encoding failures
   */
  static encodingFailed(
    outputPath?: string,
    codec?: string,
    cause?: Error
  ): MediaProcessingError {
    return new MediaProcessingError(
      'Video encoding failed. The output video could not be generated.',
      ERROR_CODES.MEDIA_ENCODING_FAILED,
      {
        suggestion: 'Try using a different codec or check available disk space',
        context: { outputPath, codec },
        severity: 'critical',
      },
      cause
    );
  }

  /**
   * Create a MediaProcessingError for filter failures
   */
  static filterFailed(
    filterName?: string,
    filterSpec?: string,
    cause?: Error
  ): MediaProcessingError {
    return new MediaProcessingError(
      'Video filter processing failed. One or more filters could not be applied.',
      ERROR_CODES.MEDIA_FILTER_FAILED,
      {
        suggestion:
          'Check filter parameters and ensure input media is compatible',
        context: { filterName, filterSpec },
        severity: 'high',
      },
      cause
    );
  }

  /**
   * Create a MediaProcessingError for metadata extraction failures
   */
  static metadataExtractionFailed(
    filePath?: string,
    cause?: Error
  ): MediaProcessingError {
    return new MediaProcessingError(
      'Failed to extract media metadata. The file may be corrupted or in an unsupported format.',
      ERROR_CODES.MEDIA_METADATA_EXTRACTION_FAILED,
      {
        suggestion:
          'Verify the file is not corrupted and is in a supported format',
        context: { filePath },
        severity: 'medium',
        recoverable: true,
      },
      cause
    );
  }
}
