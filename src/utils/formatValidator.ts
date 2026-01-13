/**
 * List of commonly supported video formats by FFmpeg
 */
export const SUPPORTED_FORMATS = [
  'mp4',
  'mkv',
  'avi',
  'mov',
  'webm',
  'flv',
  'wmv',
  'ogv',
  'm4v',
  '3gp',
  'asf',
  'f4v',
  'ts',
  'mts',
  'm2ts',
] as const;

export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

/**
 * Validates if the given format is supported
 * @param format - The format to validate
 * @returns true if supported, false otherwise
 */
export function isFormatSupported(format: string): format is SupportedFormat {
  return SUPPORTED_FORMATS.includes(format.toLowerCase() as SupportedFormat);
}

/**
 * Validates and normalizes the output format
 * @param format - The format to validate and normalize
 * @returns The normalized format
 * @throws Error if format is not supported
 */
export function validateAndNormalizeFormat(format: string): string {
  const normalizedFormat = format.toLowerCase();

  if (!isFormatSupported(normalizedFormat)) {
    throw new Error(
      `Unsupported output format: ${format}. Supported formats: ${SUPPORTED_FORMATS.join(
        ', '
      )}`
    );
  }

  return normalizedFormat;
}
