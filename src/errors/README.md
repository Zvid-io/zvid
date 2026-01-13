# Zvid.io Library - Error Handling System

This document describes the comprehensive error handling system implemented in the Zvid.io library. The system provides structured, user-friendly error messages with actionable suggestions and proper error chaining.

## Overview

The error handling system consists of:

1. **Hierarchical Error Classes** - Custom error types for different categories
2. **Error Codes** - Unique identifiers for programmatic error handling
3. **Metadata Support** - Additional context, suggestions, and documentation links
4. **Error Chaining** - Preserves original error causes for debugging
5. **API Boundary Protection** - Ensures all thrown errors are library errors

## Error Class Hierarchy

```
VideoRenderError (Base)
├── ConfigurationError
├── MediaProcessingError
├── ResourceError
├── ValidationError
├── RenderingError
└── UnexpectedError
```

### Base Error Class: VideoRenderError

All library errors extend from `VideoRenderError`, which provides:

- **Human-friendly messages** - Clear, actionable error descriptions
- **Error codes** - Unique identifiers for programmatic handling
- **Metadata** - Suggestions, documentation links, context data
- **Cause chaining** - Preserves original error stack traces
- **Severity levels** - low, medium, high, critical
- **Recoverability flags** - Indicates if the error can be recovered from

```typescript
import { VideoRenderError } from './errors';

const error = new VideoRenderError(
  'Human-readable error message',
  'VR_CATEGORY_001',
  {
    suggestion: 'How to fix this error',
    docsUrl: 'https://docs.zvid.io',
    context: { additionalData: 'value' },
    severity: 'high',
    recoverable: true,
  },
  originalError // Optional cause
);
```

## Error Categories

### 1. ConfigurationError (VR*CONFIG*\*)

Thrown when there are issues with project configuration.

**Common scenarios:**

- Missing or invalid project duration
- Invalid video dimensions
- Invalid background color format
- Missing required configuration fields

**Example:**

```typescript
import { ConfigurationError } from './errors';

// Using static factory methods
const error = ConfigurationError.missingDuration(invalidDuration);
const error2 = ConfigurationError.invalidDimensions(width, height);
```

### 2. MediaProcessingError (VR*MEDIA*\*)

Thrown when FFmpeg or media processing operations fail.

**Common scenarios:**

- FFmpeg command failures
- Invalid video/audio formats
- Encoding failures
- Filter processing errors
- Metadata extraction failures

**Example:**

```typescript
import { MediaProcessingError } from './errors';

const error = MediaProcessingError.ffmpegFailed(command, stderr);
const error2 = MediaProcessingError.invalidVideoFormat(filePath, format);
```

### 3. ResourceError (VR*RESOURCE*\*)

Thrown when there are issues accessing files, fonts, or network resources.

**Common scenarios:**

- File not found
- Font download failures
- Network errors
- Permission denied
- Insufficient disk space

**Example:**

```typescript
import { ResourceError } from './errors';

const error = ResourceError.fileNotFound(filePath);
const error2 = ResourceError.fontDownloadFailed(fontName, url);
```

### 4. ValidationError (VR*VALIDATION*\*)

Thrown when input validation fails.

**Common scenarios:**

- Invalid project type
- Missing required fields
- Invalid item types
- Invalid time ranges
- Invalid coordinates or colors

**Example:**

```typescript
import { ValidationError } from './errors';

const error = ValidationError.invalidItemType(
  itemId,
  expectedTypes,
  actualType
);
const error2 = ValidationError.invalidTimeRange(itemId, start, end, duration);
```

### 5. RenderingError (VR*RENDER*\*)

Thrown when Canvas, Puppeteer, or image generation operations fail.

**Common scenarios:**

- Canvas rendering failures
- Puppeteer browser automation failures
- SVG to PNG conversion errors
- Text generation failures
- Browser timeouts

**Example:**

```typescript
import { RenderingError } from './errors';

const error = RenderingError.canvasFailed(operation, context);
const error2 = RenderingError.puppeteerFailed(operation, url);
```

### 6. UnexpectedError (VR*UNEXPECTED*\*)

Wrapper for unknown or third-party errors to ensure API consistency.

**Common scenarios:**

- Unknown errors from third-party libraries
- System-level errors
- Unexpected runtime errors

**Example:**

```typescript
import { UnexpectedError } from './errors';

const error = UnexpectedError.fromThirdPartyError('libraryName', originalError);
const error2 = UnexpectedError.fromUnknownError(unknownError);
```

## Error Codes

Error codes follow the format: `VR_<CATEGORY>_<NUMBER>`

### Configuration Errors (001-099)

- `VR_CONFIG_001` - Missing duration
- `VR_CONFIG_002` - Invalid dimensions
- `VR_CONFIG_003` - Invalid background color
- `VR_CONFIG_004` - Missing project data
- `VR_CONFIG_005` - Invalid frame rate

### Media Processing Errors (100-199)

- `VR_MEDIA_100` - FFmpeg failed
- `VR_MEDIA_101` - Invalid video format
- `VR_MEDIA_102` - Invalid audio format
- `VR_MEDIA_103` - Encoding failed
- `VR_MEDIA_104` - Filter failed
- `VR_MEDIA_105` - Metadata extraction failed

### Resource Errors (200-299)

- `VR_RESOURCE_200` - File not found
- `VR_RESOURCE_201` - Font download failed
- `VR_RESOURCE_202` - Image load failed
- `VR_RESOURCE_203` - Network error
- `VR_RESOURCE_204` - Permission denied
- `VR_RESOURCE_205` - Insufficient disk space

### Validation Errors (300-399)

- `VR_VALIDATION_300` - Invalid project type
- `VR_VALIDATION_301` - Missing required field
- `VR_VALIDATION_302` - Invalid item type
- `VR_VALIDATION_303` - Invalid time range
- `VR_VALIDATION_304` - Invalid coordinates
- `VR_VALIDATION_305` - Invalid color format

### Rendering Errors (400-499)

- `VR_RENDER_400` - Canvas failed
- `VR_RENDER_401` - Puppeteer failed
- `VR_RENDER_402` - SVG conversion failed
- `VR_RENDER_403` - Text generation failed
- `VR_RENDER_404` - Image processing failed
- `VR_RENDER_405` - Browser timeout

### Unexpected Errors (500-599)

- `VR_UNEXPECTED_500` - Unknown error
- `VR_UNEXPECTED_501` - Third-party error
- `VR_UNEXPECTED_502` - System error

## Usage Patterns

### 1. Basic Error Handling

```typescript
import { renderVideo } from './video-render-library';
import { isVideoRenderError, getUserSafeErrorInfo } from './errors';

try {
  await renderVideo(ffmpeg, project);
} catch (error) {
  if (isVideoRenderError(error)) {
    console.log('Error code:', error.code);
    console.log('Message:', error.message);
    console.log('Suggestion:', error.metadata.suggestion);
    console.log('Recoverable:', error.isRecoverable());
  }
}
```

### 2. Error Type Checking

```typescript
import {
  isConfigurationError,
  isResourceError,
  isMediaProcessingError,
} from './errors';

try {
  // Some operation
} catch (error) {
  if (isConfigurationError(error)) {
    // Handle configuration issues
    console.log('Fix your project configuration');
  } else if (isResourceError(error)) {
    // Handle resource issues
    console.log('Check file paths and permissions');
  } else if (isMediaProcessingError(error)) {
    // Handle media processing issues
    console.log('Check FFmpeg and input files');
  }
}
```

### 3. Using ErrorFactory

```typescript
import { ErrorFactory } from './errors';

// Validate project (throws if invalid)
ErrorFactory.validateProject(project);

// Create specific errors
const fontError = ErrorFactory.fontDownloadError('Roboto');
const networkError = ErrorFactory.networkError('https://api.example.com', 404);
```

### 4. Function Wrapping

```typescript
import { ErrorHandler } from './errors';

// Wrap functions to ensure consistent error handling
const safeFunction = ErrorHandler.wrapFunction(riskyFunction, 'context');
const safeAsyncFunction = ErrorHandler.wrapAsyncFunction(
  riskyAsyncFunction,
  'context'
);

// Safe execution with result/error pattern
const result = ErrorHandler.attempt(() => riskyOperation());
if (result.success) {
  console.log('Result:', result);
} else {
  console.log('Error:', result.error.message);
}
```

### 5. Error Information Extraction

```typescript
import { getErrorDetails, getUserSafeErrorInfo } from './errors';

try {
  // Some operation
} catch (error) {
  // For debugging (includes sensitive information)
  const detailedInfo = getErrorDetails(error);
  console.log('Debug info:', JSON.stringify(detailedInfo, null, 2));

  // For users (safe information only)
  const userInfo = getUserSafeErrorInfo(error);
  console.log('User info:', JSON.stringify(userInfo, null, 2));
}
```

## Error Metadata

Each error can include metadata for enhanced user experience:

```typescript
interface ErrorMetadata {
  suggestion?: string; // How to fix the error
  docsUrl?: string; // Link to relevant documentation
  context?: Record<string, any>; // Additional context data
  severity?: 'low' | 'medium' | 'high' | 'critical';
  recoverable?: boolean; // Whether the error can be recovered from
}
```

## API Boundary Protection

The library ensures that all thrown errors are instances of `VideoRenderError`:

1. **Custom errors** are thrown unchanged
2. **Unknown errors** are wrapped in `UnexpectedError`
3. **Third-party errors** are wrapped with library context

This guarantees consistent error handling for library users.

## Best Practices

### For Library Developers

1. **Use specific error types** - Choose the most appropriate error class
2. **Provide helpful messages** - Include actionable suggestions
3. **Add context** - Include relevant data in error metadata
4. **Chain errors** - Preserve original error causes
5. **Use factory methods** - Leverage `ErrorFactory` for common scenarios

### For Library Users

1. **Check error types** - Use type guards for conditional handling
2. **Handle recoverable errors** - Check `isRecoverable()` flag
3. **Log appropriately** - Use `getErrorDetails()` for debugging, `getUserSafeErrorInfo()` for users
4. **Provide user feedback** - Show suggestions and documentation links
5. **Monitor error codes** - Track error patterns for system health

## Examples

See `src/examples/error-handling-examples.ts` for comprehensive usage examples covering all aspects of the error handling system.

## Migration Guide

If you're updating existing code to use the new error handling system:

1. **Replace generic Error throws** with specific error types
2. **Add error wrapping** at API boundaries
3. **Update error handling** to use type guards
4. **Add error metadata** for better user experience
5. **Use ErrorFactory** for common error scenarios

The error handling system is designed to be backward compatible while providing enhanced functionality for new code.
