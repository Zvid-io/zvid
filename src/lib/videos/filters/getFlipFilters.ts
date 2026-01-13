import { FilterSpecification } from 'fluent-ffmpeg';

export const getFlipFilters = (
  flipV: boolean,
  flipH: boolean,
  inputs = 'opacity_applied',
  outputs = 'flipped'
): FilterSpecification[] => {
  const flipFilters = [];

  if (flipH && flipV) {
    flipFilters.push({
      filter: 'hflip',
      options: '',
      inputs,
      outputs: 'hFlipped',
    });
    flipFilters.push({
      filter: 'vflip',
      options: '',
      inputs: 'hFlipped',
      outputs,
    });
  } else if (flipH) {
    flipFilters.push({
      filter: 'hflip',
      options: '',
      inputs,
      outputs,
    });
  } else if (flipV) {
    flipFilters.push({
      filter: 'vflip',
      options: '',
      inputs,
      outputs,
    });
  }

  return flipFilters;
};
