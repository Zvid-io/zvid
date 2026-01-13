import { ResolutionDimensions, ResolutionPreset } from '../types';

export const RESOLUTION_PRESETS: Record<
  ResolutionPreset,
  ResolutionDimensions | null
> = {
  sd: { width: 640, height: 480 },
  hd: { width: 1280, height: 720 },
  'full-hd': { width: 1920, height: 1080 },
  squared: { width: 1080, height: 1080 },
  'youtube-short': { width: 1080, height: 1920 },
  'youtube-video': { width: 1920, height: 1080 },
  tiktok: { width: 1080, height: 1920 },
  'instagram-reel': { width: 1080, height: 1920 },
  'instagram-post': { width: 1080, height: 1080 },
  'instagram-story': { width: 1080, height: 1920 },
  'instagram-feed': { width: 1080, height: 1080 },
  'twitter-landscape': { width: 1200, height: 675 },
  'twitter-portrait': { width: 1080, height: 1350 },
  'twitter-square': { width: 1080, height: 1080 },
  'facebook-video': { width: 1080, height: 1920 },
  'facebook-story': { width: 1080, height: 1920 },
  'facebook-post': { width: 1080, height: 1080 },
  snapshat: { width: 1080, height: 1920 },
  custom: null, // Uses explicit width/height
};
