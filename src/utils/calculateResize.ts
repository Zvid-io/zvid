import configInstance from '../lib/config/config';
import { ResizeMode } from '../types/items.type';

export interface ResizeCalculation {
  width: number;
  height: number;
}

export default function calculateResize(
  resizeMode: ResizeMode,
  originalWidth: number,
  originalHeight: number
): ResizeCalculation {
  const { width: targetWidth, height: targetHeight } =
    configInstance.getConfig();
  if (!originalWidth || !originalHeight || !targetWidth || !targetHeight) {
    // If any dimension is missing, return target dimensions as fallback
    return { width: targetWidth, height: targetHeight };
  }

  const originalAspectRatio = originalWidth / originalHeight;
  const targetAspectRatio = targetWidth / targetHeight;

  switch (resizeMode) {
    case 'contain':
      // Scale to fit within bounds while maintaining aspect ratio
      // The entire image will be visible, but there may be letterboxing
      if (originalAspectRatio > targetAspectRatio) {
        // Image is wider than target - fit to width
        return {
          width: targetWidth,
          height: Math.round(targetWidth / originalAspectRatio),
        };
      } else {
        // Image is taller than target - fit to height
        return {
          width: Math.round(targetHeight * originalAspectRatio),
          height: targetHeight,
        };
      }

    case 'cover':
      // Scale to fill bounds while maintaining aspect ratio
      // The image will fill the entire area, but parts may be cropped
      if (originalAspectRatio > targetAspectRatio) {
        // Image is wider than target - fit to height (crop width)
        return {
          width: Math.round(targetHeight * originalAspectRatio),
          height: targetHeight,
        };
      } else {
        // Image is taller than target - fit to width (crop height)
        return {
          width: targetWidth,
          height: Math.round(targetWidth / originalAspectRatio),
        };
      }

    default:
      return { width: targetWidth, height: targetHeight };
  }
}
