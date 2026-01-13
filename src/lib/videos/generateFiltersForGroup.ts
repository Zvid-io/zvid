import { Item, VideoItem } from '../../types/items.type';
import generateFilterForItem from './generateFiltersForItem';
import generateTransitionsFilters from './filters/generateTransitionsFilters';
import { computeAnchoredOverlayPosition } from '../../utils/anchorPosition'; // <— new import

export function generateFiltersForGroup(itemsGroups: Item[][]) {
  return itemsGroups.map((group, groupIndex) => {
    const withGroup = group.length > 1;
    const groupFilters = group.flatMap((item, itemIndex) => {
      const inputNumber =
        'inputNumber' in item && item.inputNumber !== undefined
          ? item.inputNumber
          : itemIndex + 1;
      return generateFilterForItem(
        item,
        inputNumber,
        `filterd_${itemIndex}_${groupIndex}`,
        withGroup
      );
    });

    withGroup &&
      groupFilters.push(
        ...generateTransitionsFilters({
          group,
          groupNumber: groupIndex,
        })
      );

    const intervals = group.map(({ enterBegin, exitEnd }) => [
      enterBegin,
      exitEnd,
    ]);

    const inputs =
      group.length > 1
        ? `xfaded_${group.length - 2}_${groupIndex}`
        : `filterd_${0}_${groupIndex}`;

    const previousOutput =
      groupIndex === 0 ? '[0:v]' : `outv-${groupIndex - 1}`;

    // Only apply anchor when we're NOT using transition canvas
    let x: number | string = 0;
    let y: number | string = 0;

    if (!withGroup) {
      const item0 = group[0];
      const pos = computeAnchoredOverlayPosition(
        item0.x,
        item0.y,
        item0.anchor
      );
      x = pos.x;
      y = pos.y;
    }

    groupFilters.push({
      filter: 'overlay',
      options: {
        x,
        y,
        enable: `between(t,${intervals[0][0]},${
          intervals[group.length - 1][1]
        })`,
      },
      inputs: [previousOutput, inputs],
      outputs: `outv-${groupIndex}`,
    });

    return groupFilters;
  });
}
