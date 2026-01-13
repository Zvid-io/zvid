import { Item, VideoItem } from '../../types/items.type';
import { checkIsVideo } from '../elements-types/checking';

function isVideoDataType(item: Item): item is VideoItem {
  return checkIsVideo(item);
}

export default function hasTransitionEffect(item: Item) {
  const test = isVideoDataType(item);

  if (!isVideoDataType(item)) return;

  const { transition } = item;

  return transition;
}
