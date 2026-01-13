import { AudioItem, Item } from '../../types/items.type';

export default function sortItemsByTrackAndStartTime(
  items: (Item | AudioItem)[],
  type: 'VID' | 'AUD'
) {
  return items.sort((itemA: any, itemB: any) => {
    const result = itemA.track - itemB.track;
    if (result === 0)
      return type === 'VID'
        ? itemA.enterBegin - itemB.enterBegin
        : itemA.playStart - itemB.playStart;

    return result;
  });
}
