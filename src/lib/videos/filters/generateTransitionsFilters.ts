import { FilterSpecification } from 'fluent-ffmpeg';
import { Item, VideoItem } from '../../../types/items.type';
import configInstance from '../../config/config';
import { computeAnchoredOverlayPosition } from '../../../utils/anchorPosition'; // <— new import

type Params = {
  group: Item[];
  groupNumber: number;
};

export default function generateTransitionsFilters({
  group,
  groupNumber,
}: Params) {
  const filters: FilterSpecification[] = [];
  const { width, height } = configInstance.getConfig();

  group.forEach((item, itemIndex) => {
    const { x, y, anchor } = item;

    const { x: overlayX, y: overlayY } = computeAnchoredOverlayPosition(
      x,
      y,
      anchor
    );

    filters.push({
      filter: 'color',
      options: {
        c: '#00000000',
        s: `${width}x${height}`,
      },
      outputs: `base_canvas_${itemIndex}_${groupNumber}`,
    });

    filters.push({
      filter: 'overlay',
      options: {
        x: overlayX,
        y: overlayY,
      },
      inputs: [
        `base_canvas_${itemIndex}_${groupNumber}`,
        `filterd_${itemIndex}_${groupNumber}`,
      ],
      outputs: `re_based_${itemIndex}_${groupNumber}`,
    });
  });

  for (let itemIndex = 0; itemIndex < group.length - 1; itemIndex++) {
    const { transitionDuration, transition } = group[itemIndex] as VideoItem;
    const offset = (group[itemIndex + 1] as VideoItem).enterBegin;

    const inputs =
      itemIndex === 0
        ? [`re_based_0_${groupNumber}`, `re_based_1_${groupNumber}`]
        : [
            `xfaded_${itemIndex - 1}_${groupNumber}`,
            `re_based_${itemIndex + 1}_${groupNumber}`,
          ];

    filters.push({
      filter: 'xfade',
      options: {
        transition,
        duration: transitionDuration,
        offset,
      },
      inputs,
      outputs: `xfaded_${itemIndex}_${groupNumber}`,
    });
  }

  return filters;
}
