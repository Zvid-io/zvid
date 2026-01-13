import { SVGItem } from '../../types/items.type';
import takeScreenShot from '../shared/takeScreenShot';
import buildHtmlContent from './buildHtmlContent';
import constructSVG from './constructSVG';

export default async function applySvgModifications(svgItem: SVGItem) {
  try {
    const { src } = await constructSVG(svgItem);
    svgItem.src = src;
    const htmlContent = buildHtmlContent(svgItem);
    const svgPath = await takeScreenShot(htmlContent);
    return svgPath;
  } catch (error: unknown) {
    throw error;
  }
}
