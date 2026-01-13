import configInstance from '../lib/config/config';
import { PositionPreset } from '../types/items.type';

export interface PositionCalculation {
  x: number;
  y: number;
}

export default function calculatePosition(
  position: PositionPreset,
  itemWidth: number,
  itemHeight: number,
  currentX: number = 0,
  currentY: number = 0
): PositionCalculation {
  const { width: projectWidth, height: projectHeight } =
    configInstance.getConfig();

  switch (position) {
    case 'top-left':
      return { x: 0, y: 0 };

    case 'top-center':
      return {
        x: projectWidth / 2,
        y: 0,
      };

    case 'top-right':
      return { x: projectWidth, y: 0 };

    case 'center-left':
      return {
        x: 0,
        y: projectHeight / 2,
      };

    case 'center-center':
      return {
        x: projectWidth / 2,
        y: projectHeight / 2,
      };

    case 'center-right':
      return {
        x: projectWidth,
        y: projectHeight / 2,
      };

    case 'bottom-left':
      return { x: 0, y: projectHeight };

    case 'bottom-center':
      return {
        x: projectWidth / 2,
        y: projectHeight,
      };

    case 'bottom-right':
      return {
        x: projectWidth,
        y: projectHeight,
      };

    case 'custom':
    default:
      return { x: currentX, y: currentY };
  }
}
