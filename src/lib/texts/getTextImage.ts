import { Project, TextItem } from '../../types/items.type';
import buildHtmlContent from './buildHtmlContent';
import takeScreenShot from '../shared/takeScreenShot';
import type * as CSS from 'csstype';

export default async function getTextImage(textItem: TextItem) {
  const { width, height, html, text, style } = textItem;

  const htmlContent = await buildHtmlContent({
    height,
    width,
    html: html ? html.replace(/\\/g, '') : undefined,
    text,
    ...style,
  } as CSS.Properties & {
    html?: string;
    text?: string;
    width: number;
    height: number;
  });
  // In case of text item, we need to add exact the same with and height of the item, otherwise
  // It would cause a conflict in the animation stage, and will cause FFMPEG to fail
  const {
    src,
    width: imageWidth,
    height: imageHeight,
  } = await takeScreenShot(htmlContent, textItem);

  return { src, width: imageWidth, height: imageHeight };
}
