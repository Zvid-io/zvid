import { FilterSpecification } from 'fluent-ffmpeg';

export const getCoverFilter = (
  params: {
    width: number; // Viewport width (post-crop)
    height: number; // Viewport height (post-crop)
    cropParams?: {
      x: number; // Crop start X in px on original
      y: number; // Crop start Y in px on original
      width: number; // Crop width in px on original
      height: number; // Crop height in px on original
    };
  },
  inputs = 'formatted',
  inputNumber: number,
  outputs = 'covered'
): FilterSpecification[] => {
  const { width, height, cropParams } = params;

  if (!cropParams) {
    // No cropping: just scale to the viewport
    return [
      {
        filter: 'scale',
        options: `${width}:${height}`,
        inputs,
        outputs: `scaled_${inputNumber}`,
      },
      {
        filter: 'format',
        options: 'rgba',
        inputs: `scaled_${inputNumber}`,
        outputs,
      },
    ];
  }

  const { x, y, width: cw, height: ch } = cropParams;

  // 1) Crop from the original coordinates (absolute px)
  // 2) Scale that cropped region to the desired viewport size
  return [
    {
      filter: 'crop',
      options: `${cw}:${ch}:${x}:${y}`,
      inputs,
      outputs: `cropped_${inputNumber}`,
    },
    {
      filter: 'scale',
      options: `${width}:${height}`,
      inputs: `cropped_${inputNumber}`,
      outputs: `scaled_${inputNumber}`,
    },
    {
      filter: 'format',
      options: 'rgba',
      inputs: `scaled_${inputNumber}`,
      outputs,
    },
  ];
};
