import { ResolutionDimensions } from '../types';
import { RESOLUTION_PRESETS } from '../constants/RESOLUTION_PRESETS';
import { Project } from '../types/items.type';

/**
 * Resolves the width and height for a project based on the resolution property.
 * If resolution is provided and not 'custom', it overrides width and height.
 * If resolution is 'custom' or not provided, falls back to explicit width/height or defaults.
 */
export function resolveProjectDimensions(
  project: Project
): ResolutionDimensions {
  const { resolution, width, height } = project;

  // If resolution is specified and not 'custom', use the preset dimensions
  if (resolution && resolution !== 'custom') {
    const presetDimensions = RESOLUTION_PRESETS[resolution];
    if (presetDimensions) {
      return presetDimensions;
    }
  }

  // Fall back to explicit width/height or defaults
  return {
    width: width ?? 1280,
    height: height ?? 720,
  };
}
