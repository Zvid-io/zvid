import { Item } from '../types/items.type';

/**
 * x, y = coordinate of the anchor point in the main video.
 *
 * Examples on 1280x720:
 *   - center-center at (640, 360)  → overlay centered there
 *   - top-left at (0, 0)          → overlay's top-left at (0,0)
 *   - bottom-right at (1280, 720) → overlay's bottom-right at (1280,720)
 */
export function computeAnchoredOverlayPosition(
  x: number | undefined,
  y: number | undefined,
  anchor: Item['anchor'] = 'top-left'
): { x: number | string; y: number | string } {
  const ax = x ?? 0; // anchor X in main coordinates
  const ay = y ?? 0; // anchor Y in main coordinates

  switch (anchor) {
    case 'top-left':
      // given (x,y) is the top-left of overlay
      return { x: ax, y: ay };

    case 'top-center':
      // given (x,y) is the top center of overlay
      return {
        x: `${ax} - overlay_w / 2`,
        y: ay,
      };

    case 'top-right':
      // given (x,y) is the top-right of overlay
      return {
        x: `${ax} - overlay_w`,
        y: ay,
      };

    case 'center-left':
      // given (x,y) is the center-left of overlay
      return {
        x: ax,
        y: `${ay} - overlay_h / 2`,
      };

    case 'center-center':
      // given (x,y) is the center of overlay
      return {
        x: `${ax} - overlay_w / 2`,
        y: `${ay} - overlay_h / 2`,
      };

    case 'center-right':
      // given (x,y) is the center-right of overlay
      return {
        x: `${ax} - overlay_w`,
        y: `${ay} - overlay_h / 2`,
      };

    case 'bottom-left':
      // given (x,y) is the bottom-left of overlay
      return {
        x: ax,
        y: `${ay} - overlay_h`,
      };

    case 'bottom-center':
      // given (x,y) is the bottom-center of overlay
      return {
        x: `${ax} - overlay_w / 2`,
        y: `${ay} - overlay_h`,
      };

    case 'bottom-right':
      // given (x,y) is the bottom-right of overlay
      return {
        x: `${ax} - overlay_w`,
        y: `${ay} - overlay_h`,
      };

    default:
      return { x: ax, y: ay };
  }
}
