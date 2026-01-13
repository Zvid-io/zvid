import {
  ImageItem,
  Item,
  TextItem,
  VideoItem,
  GIFItem,
  SVGItem, // Added SVGItem
} from '../../types/items.type';

export function checkIsSvg(item: Item): item is SVGItem {
  const svgTypes = ['SVG'];
  return svgTypes.includes(item.type);
}

export function checkIsVideo(item: Item): item is VideoItem {
  return (
    /vide?o?/i.test(item.type) ||
    'videoDuration' in item ||
    item.type === 'VIDEO'
  );
}

export function checkIsGif(item: Item): item is GIFItem {
  return item.type === 'GIF';
}

export function checkIsText(item: Item): item is TextItem {
  return item.type === 'TEXT';
}

export function checkIsImage(item: Item): item is ImageItem {
  // Exclude SVG types as they are handled separately
  return /ima?ge?/i.test(item.type) && !checkIsSvg(item);
}
