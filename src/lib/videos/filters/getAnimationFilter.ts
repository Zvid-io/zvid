import { FilterSpecification } from 'fluent-ffmpeg';
import { Item, VideoItem } from '../../../types/items.type';
import { checkIsGif, checkIsVideo } from '../../elements-types/checking';

type Params = {
  width: number;
  height: number;
  fps?: number | null;
  inputNumber: number;
  duration?: number;
};

/**
 * Checks if the item is a video type by looking for 'vid' in the type string.
 * This is more robust and works for types like 'UPVIDEO' and 'STOCKVID'.
 * @param item The item to check.
 * @returns True if the item is a video, false otherwise.
 */
function isVideo(item: Item): boolean {
  // This is the corrected line to properly detect all video types
  return item.type.toLowerCase().includes('vid');
}

export default function getAnimationFilters(
  item: VideoItem,
  inputNumber: number,
  initialInputs: string
) {
  const filters: FilterSpecification[] = [];
  const {
    enterAnimation,
    exitAnimation,
    width,
    height,
    enterBegin,
    enterEnd,
    exitBegin,
    exitEnd,
    videoDuration,
  } = item;
  const base = item.enterBegin ?? 0;

  const enterBeginL = (item.enterBegin ?? 0) - base; // => 0
  const enterEndL = (item.enterEnd ?? 0) - base;

  const exitBeginL = (item.exitBegin ?? 0) - base;
  const exitEndL = (item.exitEnd ?? 0) - base;

  // For durations, still use differences (they’re invariant)
  const enterDur = Math.max(0, enterEndL - enterBeginL);
  const exitDur = Math.max(0, exitEndL - exitBeginL);

  const fps = item.frameRate || 30;
  const isAnimatedItem = checkIsVideo(item) || checkIsGif(item);
  // Use videoDuration for videos, and fallback to exitEnd or playEnd for images
  const duration = isAnimatedItem ? videoDuration : exitEnd;

  let inputs = initialInputs;
  let outputs = '';

  // This block now correctly runs ONLY for non-video types (images)
  if (!isAnimatedItem) {
    filters.push({
      filter: 'loop',
      options: { loop: -1, size: 1, start: 0 },
      inputs: `${initialInputs}`,
      outputs: `looped_${inputNumber}`,
    });
    filters.push({
      filter: 'setpts',
      options: 'PTS-STARTPTS',
      inputs: `looped_${inputNumber}`,
      outputs: `pts_reset_${inputNumber}`,
    });
    filters.push({
      filter: 'trim',
      options: { duration },
      inputs: `pts_reset_${inputNumber}`,
      outputs: `trimmed_${inputNumber}`,
    });
    filters.push({
      filter: 'fps',
      options: fps,
      inputs: `trimmed_${inputNumber}`,
      outputs: `initial_stream_${inputNumber}`,
    });
    // The input for the next filter is now the processed image stream
    inputs = `initial_stream_${inputNumber}`;
  }

  if (isItemHasEnterAnimation(item)) {
    filters.push(
      ...generateMatchingBackground('enter', {
        fps,
        width: width as number,
        height: height as number,
        inputNumber,
        duration,
      })
    );

    if (fps) {
      filters.push({
        filter: 'fps',
        options: fps,
        inputs: inputs,
        outputs: `${inputs}_fps`,
      });
    }

    outputs = `enterAnimated_${inputNumber}`;
    filters.push({
      filter: 'xfade',
      options: {
        transition: enterAnimation,
        duration: +enterDur.toFixed(2),
        offset: 0,
      },
      inputs: [
        `enter_base_animation_${inputNumber}_${fps ? 'fps' : 'rgba'}`,
        `${fps ? `${inputs}_fps` : inputs}`,
      ],
      outputs,
    });

    inputs = outputs;
  }

  if (isItemHasExitAnimation(item)) {
    filters.push(
      ...generateMatchingBackground('exit', {
        fps,
        width: width as number,
        height: height as number,
        inputNumber,
        duration,
      })
    );

    if (fps) {
      filters.push({
        filter: 'fps',
        options: fps,
        inputs: inputs,
        outputs: `${inputs}_fps`,
      });
    }

    outputs = `exitAnimated_${inputNumber}`;
    filters.push({
      filter: 'xfade',
      options: {
        transition: exitAnimation,
        duration: +exitDur.toFixed(2),
        offset: +exitBeginL.toFixed(2), // ✅ local timeline
      },
      inputs: [
        `${fps ? `${inputs}_fps` : inputs}`,
        `exit_base_animation_${inputNumber}_${fps ? 'fps' : 'rgba'}`,
      ],
      outputs,
    });
  }

  return { filters, outputs: outputs || inputs };
}

function generateMatchingBackground(
  type: 'exit' | 'enter',
  { width, height, fps, inputNumber, duration }: Params
) {
  const filters: FilterSpecification[] = [
    {
      filter: 'color',
      options: {
        c: '0x00000000',
        s: `${width}x${height}`,
        ...(fps && { r: fps }),
        ...(duration && { d: duration }),
      },
      outputs: `${type}_base_animation_${inputNumber}`,
    },
    {
      filter: 'format',
      options: 'rgba',
      inputs: `${type}_base_animation_${inputNumber}`,
      outputs: `${type}_base_animation_${inputNumber}_rgba`,
    },
  ];
  if (fps) {
    filters.push({
      filter: 'fps',
      options: fps,
      inputs: `${type}_base_animation_${inputNumber}_rgba`,
      outputs: `${type}_base_animation_${inputNumber}_fps`,
    });
  }

  return filters;
}

function isItemHasEnterAnimation(item: any) {
  const { enterAnimation, enterBegin, enterEnd } = item;
  if (!enterAnimation || enterEnd <= enterBegin) return false;
  return enterAnimation !== null;
}
function isItemHasExitAnimation(item: any) {
  const { exitAnimation, exitBegin, exitEnd, transition, transitionId } = item;
  if (!exitAnimation || exitEnd <= exitBegin) return false;
  return (
    exitAnimation !== null &&
    (!transition || !transitionId || transitionId === 'none')
  );
}
export function isItemHasAnimation(item: Item) {
  return isItemHasEnterAnimation(item) || isItemHasExitAnimation(item);
}
