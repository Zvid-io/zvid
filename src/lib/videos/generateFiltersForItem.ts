import { FilterSpecification } from 'fluent-ffmpeg';
import { Item, VideoItem } from '../../types/items.type';
import calcImageRect from '../../utils/calcImageRect';
import calcRangeMap from '../../utils/calcRangeMap';
import { getCoverFilter } from './filters/getCoverFilter';
import getStyleFilters from './filters/getStyleFilters';
import {
  checkIsGif,
  checkIsImage,
  checkIsSvg,
  checkIsVideo,
} from '../elements-types/checking';
import { getFlipFilters } from './filters/getFlipFilters';
import { isItemHasAnimation } from './filters/getAnimationFilter';
import getAnimationFilters from './filters/getAnimationFilter';
import getZoomFilter from './filters/getZoomFilter';

export default function generateFilterForItem(
  elemData: Item,
  inputNumber: number,
  outputLabel: string,
  withGroup: boolean
) {
  const { angle, width, height, flipV, flipH, opacity, enterBegin, x, y } =
    elemData;

  const cropParams = 'cropParams' in elemData ? elemData.cropParams : undefined;
  const chromaKey = 'chromaKey' in elemData ? elemData.chromaKey : undefined;
  const filter = 'filter' in elemData ? elemData.filter : undefined;
  const zoom = 'zoom' in elemData ? elemData.zoom : undefined;

  const {
    width: ow,
    height: oh,
    offsetX,
    offsetY,
  } = calcImageRect(width as number, height as number, angle as number);
  elemData.x = +`${(x as number) - offsetX}`;
  elemData.y = +`${(y as number) - offsetY}`;

  if (angle !== 0) {
    elemData.width = ow;
    elemData.height = oh;
  }

  let inputs = `[${inputNumber}:v]`;

  const filters: FilterSpecification[] = [];

  if (checkIsVideo(elemData) || checkIsGif(elemData)) {
    const { speed } = elemData as VideoItem;

    if (speed && speed !== 1) {
      const setptsValue = 1 / speed;
      filters.push({
        filter: 'setpts',
        options: `PTS*${setptsValue}`,
        inputs,
        outputs: `speed_${inputNumber}`,
      });
      inputs = `speed_${inputNumber}`;
    }

    filters.push(
      ...getCoverFilter(
        {
          width: width as number,
          height: height as number,
          cropParams: cropParams,
        },
        inputs,
        inputNumber,
        `covered_${inputNumber}`
      )
    );
    inputs = `covered_${inputNumber}`;
  }

  if (opacity && opacity !== 1) {
    filters.push({
      filter: 'format',
      options: 'rgba',
      inputs,
      outputs: `with_alpha_${inputNumber}`,
    });
    inputs = `with_alpha_${inputNumber}`;

    filters.push({
      filter: 'colorchannelmixer',
      options: `aa=${opacity}`,
      inputs,
      outputs: `opacity_applied_${inputNumber}`,
    });
    inputs = `opacity_applied_${inputNumber}`;
  }

  if (chromaKey) {
    const similarity = Math.max(
      0.01,
      calcRangeMap(
        {
          value: chromaKey.similarity || 0.01,
          min: 0.0,
          max: 1,
          inputMin: 0,
          inputMax: 100,
        },
        'DECIMAL'
      )
    );
    const blend = Math.max(
      0.01,
      calcRangeMap(
        {
          value: chromaKey.blend || 0,
          min: 0.0,
          max: 1,
          inputMin: 0,
          inputMax: 100,
        },
        'DECIMAL'
      )
    );
    const parsedChromaKey = chromaKey.color.replace('#', '0x');

    filters.push({
      filter: 'colorkey',
      options: `${parsedChromaKey}:${similarity}:${blend}`,
      inputs,
      outputs: `green_screen_${inputNumber}`,
    });
    inputs = `green_screen_${inputNumber}`;
  }

  if (filter) {
    const { filters: styleFilters, output } = getStyleFilters(
      filter,
      inputs,
      inputNumber,
      elemData
    );
    filters.push(...styleFilters);
    inputs = output;
  }

  if (flipV || flipH) {
    filters.push(
      ...getFlipFilters(
        flipV as boolean,
        flipH as boolean,
        inputs,
        `flipped_${inputNumber}`
      )
    );
    inputs = `flipped_${inputNumber}`;
  }

  if (angle !== 0) {
    filters.push({
      filter: 'rotate',
      options: `${angle}*PI/180:c=none:ow=${ow}:oh=${oh}`,
      inputs,
      outputs: `rotated_${inputNumber}`,
    });
    inputs = `rotated_${inputNumber}`;
  }

  if (isItemHasAnimation(elemData)) {
    const { filters: animationFilters, outputs: updatedInputs } =
      getAnimationFilters(elemData as VideoItem, inputNumber, inputs);
    filters.push(...animationFilters);
    inputs = updatedInputs;
  }

  // NEW: zoom (images & videos). For videos, getZoomFilter does setsar+scale first.
  if (
    'zoom' in elemData &&
    elemData.zoom &&
    (checkIsImage(elemData) || checkIsVideo(elemData) || checkIsGif(elemData))
  ) {
    const { filters: zoomFilters, output } = getZoomFilter(
      elemData,
      inputs,
      inputNumber
    );
    filters.push(...zoomFilters);
    inputs = output;
  }

  if ((enterBegin as number) > 0 && !withGroup) {
    filters.push({
      filter: 'setpts',
      // PTS-STARTPTS makes sure we don't carry weird timestamps from upstream
      options: `PTS-STARTPTS+${enterBegin}/TB`,
      inputs,
      outputs: `delayed_${inputNumber}`,
    });
    inputs = `delayed_${inputNumber}`;
  }

  filters.length === 0
    ? filters.push({
        filter: 'null',
        inputs,
        outputs: outputLabel,
      })
    : (filters[filters.length - 1].outputs = outputLabel);

  return filters;
}
