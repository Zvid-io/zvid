/**
 * Examples demonstrating how to use the Zvid.io library's error handling system
 */

import {
  VideoRenderError,
  ConfigurationError,
  MediaProcessingError,
  ResourceError,
  ValidationError,
  RenderingError,
  UnexpectedError,
  ErrorHandler,
  ErrorFactory,
  isVideoRenderError,
  isConfigurationError,
  isResourceError,
  isMediaProcessingError,
  isRenderingError,
  getErrorDetails,
  getUserSafeErrorInfo,
  ERROR_CODES,
} from '../errors';
import { Project } from '../types/items.type';

/**
 * Example 1: Basic error handling with try-catch
 */
export async function basicErrorHandlingExample() {
  try {
    // Some operation that might fail
    throw new Error('Something went wrong');
  } catch (error) {
    // Wrap unknown errors
    const wrappedError = ErrorHandler.wrapError(error);

    console.log('Error code:', wrappedError.code);
    console.log('Error message:', wrappedError.message);
    console.log('Is recoverable:', wrappedError.isRecoverable());
    console.log('Severity:', wrappedError.getSeverity());
  }
}

/**
 * Example 2: Creating specific error types
 */
export function createSpecificErrors() {
  // Configuration error
  const configError = ConfigurationError.invalidDuration(undefined);
  console.log('Config error:', configError.toUserObject());

  // Resource error
  const resourceError = ResourceError.fileNotFound('/path/to/missing/file.mp4');
  console.log('Resource error:', resourceError.toUserObject());

  // Media processing error
  const mediaError = MediaProcessingError.ffmpegFailed(
    'ffmpeg command',
    'stderr output'
  );
  console.log('Media error:', mediaError.toUserObject());

  // Rendering error
  const renderError = RenderingError.canvasFailed('text rendering', {
    fontSize: 24,
  });
  console.log('Render error:', renderError.toUserObject());
}

/**
 * Example 3: Using ErrorFactory for common scenarios
 */
export function errorFactoryExamples() {
  // Validate project (throws if invalid)
  const invalidProject = { invalid: 'data' };
  try {
    ErrorFactory.validateProject(invalidProject);
  } catch (error) {
    if (isConfigurationError(error)) {
      console.log('Configuration validation failed:', error.message);
      console.log('Suggestion:', error.metadata.suggestion);
    }
  }

  // Create errors using factory methods
  const fontError = ErrorFactory.fontDownloadError(
    'Roboto',
    'https://fonts.google.com/...'
  );
  const networkError = ErrorFactory.networkError(
    'https://api.example.com',
    404
  );
  const canvasError = ErrorFactory.canvasError('image processing', {
    width: 1920,
    height: 1080,
  });

  console.log('Font error code:', fontError.code);
  console.log('Network error code:', networkError.code);
  console.log('Canvas error code:', canvasError.code);
}

/**
 * Example 4: Error chaining and cause tracking
 */
export function errorChainingExample() {
  try {
    // Simulate a nested error scenario
    try {
      throw new Error('Original file system error');
    } catch (originalError) {
      throw ResourceError.fileNotFound('/path/to/file', originalError as Error);
    }
  } catch (error) {
    if (isVideoRenderError(error)) {
      console.log('Main error:', error.message);
      console.log('Original cause:', error.cause?.message);
      console.log(
        'Full error details:',
        JSON.stringify(getErrorDetails(error), null, 2)
      );
    }
  }
}

/**
 * Example 5: Using error handlers for function wrapping
 */
export function functionWrappingExample() {
  // Wrap a function that might throw
  const riskyFunction = (input: string) => {
    if (!input) {
      throw new Error('Input is required');
    }
    return input.toUpperCase();
  };

  const safeFunction = ErrorHandler.wrapFunction(
    riskyFunction,
    'stringProcessing'
  );

  try {
    const result = safeFunction(''); // This will throw a wrapped error
  } catch (error) {
    if (isVideoRenderError(error)) {
      console.log('Wrapped error:', error.message);
      console.log('Context:', error.metadata.context);
    }
  }
}

/**
 * Example 6: Async function error handling
 */
export async function asyncErrorHandlingExample() {
  const riskyAsyncFunction = async (delay: number) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    throw new Error('Async operation failed');
  };

  const safeAsyncFunction = ErrorHandler.wrapAsyncFunction(
    riskyAsyncFunction,
    'asyncOperation'
  );

  try {
    await safeAsyncFunction(100);
  } catch (error) {
    console.log('Async error handled:', getUserSafeErrorInfo(error));
  }
}

/**
 * Example 7: Error type checking and conditional handling
 */
export function errorTypeCheckingExample() {
  const errors = [
    ConfigurationError.invalidDuration(),
    ResourceError.fileNotFound('/missing/file'),
    MediaProcessingError.ffmpegFailed(),
    RenderingError.canvasFailed('operation'),
    UnexpectedError.fromUnknownError('Unknown error'),
  ];

  errors.forEach((error, index) => {
    console.log(`\nError ${index + 1}:`);
    console.log('Type:', error.constructor.name);
    console.log('Code:', error.code);
    console.log('Severity:', error.getSeverity());
    console.log('Recoverable:', error.isRecoverable());

    // Handle different error types differently
    if (isConfigurationError(error)) {
      console.log(
        '→ This is a configuration issue - check your project settings'
      );
    } else if (isResourceError(error)) {
      console.log(
        '→ This is a resource issue - check file paths and permissions'
      );
    } else if (isMediaProcessingError(error)) {
      console.log(
        '→ This is a media processing issue - check FFmpeg and input files'
      );
    } else if (isRenderingError(error)) {
      console.log(
        '→ This is a rendering issue - check Canvas and Puppeteer setup'
      );
    } else {
      console.log('→ This is an unexpected error - please report this issue');
    }
  });
}

/**
 * Example 8: Safe execution with error handling
 */
export function safeExecutionExample() {
  // Using ErrorHandler.attempt for synchronous operations
  const syncResult = ErrorHandler.attempt(() => {
    return JSON.parse('{"valid": "json"}');
  });

  if (syncResult.success) {
    console.log('Parsed JSON:', syncResult.data);
  } else {
    console.log('Parse failed:', syncResult.error.message);
  }

  // Using ErrorHandler.attemptAsync for async operations
  ErrorHandler.attemptAsync(async () => {
    // Simulate async operation
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 'Success!';
  }).then((result) => {
    if (result.success) {
      console.log('Async operation succeeded:', result.data);
    } else {
      console.log('Async operation failed:', result.error.message);
    }
  });
}

/**
 * Example 9: Custom error metadata usage
 */
export function customMetadataExample() {
  const error = new ValidationError(
    'Invalid video dimensions provided',
    ERROR_CODES.VALIDATION_INVALID_COORDINATES,
    {
      suggestion: 'Use standard video dimensions like 1920x1080 or 1280x720',
      docsUrl: 'https://docs.zvid.io',
      context: {
        providedWidth: -100,
        providedHeight: 'invalid',
        supportedFormats: ['1920x1080', '1280x720', '854x480'],
      },
      severity: 'high',
      recoverable: true,
    }
  );

  console.log('Error with custom metadata:');
  console.log('Message:', error.message);
  console.log('Suggestion:', error.metadata.suggestion);
  console.log('Docs:', error.metadata.docsUrl);
  console.log('Context:', error.metadata.context);
  console.log('User-safe info:', error.toUserObject());
}

/**
 * Example 10: Error logging and monitoring
 */
export function errorLoggingExample() {
  const error = MediaProcessingError.ffmpegFailed(
    'ffmpeg -i input.mp4 output.mp4',
    'Error: Invalid codec'
  );

  // For development/debugging - includes sensitive information
  const detailedLog = getErrorDetails(error);
  console.log(
    'Detailed error log (for developers):',
    JSON.stringify(detailedLog, null, 2)
  );

  // For user-facing logs - safe information only
  const userLog = getUserSafeErrorInfo(error);
  console.log('User-safe error log:', JSON.stringify(userLog, null, 2));

  // For monitoring systems - structured data
  const monitoringData = {
    timestamp: error.timestamp,
    errorCode: error.code,
    severity: error.getSeverity(),
    recoverable: error.isRecoverable(),
    category: error.isCategory('MEDIA') ? 'media' : 'other',
    message: error.message,
  };
  console.log('Monitoring data:', JSON.stringify(monitoringData, null, 2));
}

// Export all examples for easy testing
export const examples = {
  basicErrorHandlingExample,
  createSpecificErrors,
  errorFactoryExamples,
  errorChainingExample,
  functionWrappingExample,
  asyncErrorHandlingExample,
  errorTypeCheckingExample,
  safeExecutionExample,
  customMetadataExample,
  errorLoggingExample,
};
