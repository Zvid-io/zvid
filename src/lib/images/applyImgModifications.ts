import { ImageItem } from '../../types/items.type';
import buildHtmlContent from './buildHtmlContent';
import takeScreenShot from '../shared/takeScreenShot';

export default async function applyImgModifications(imageItem: ImageItem) {
  const htmlContent = await buildHtmlContent(imageItem);
  const { src } = await takeScreenShot(htmlContent, imageItem);

  return src;
}
