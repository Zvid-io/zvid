import path from 'path';
import PuppeteerManager from '../../utils/puppeteerManager';
import { randomUUID } from 'crypto';
import { ImageItem, Item, Project } from '../../types/items.type';

// In case of text item, we need to add exact the same with and height of the item, otherwise
// It would cause a conflict in the animation stage, and will cause FFMPEG to fail
export default async function takeScreenShot(htmlContent: string, item?: Item) {
  const puppeteerManager = PuppeteerManager.getInstance();
  const page = await puppeteerManager.newPage();

  const tempDir = await puppeteerManager.getTempDirectory();
  await page.setContent(htmlContent);

  const contentDimensions = await page.evaluate(() => {
    const element = document.querySelector('.container');
    const { width, height } = element!.getBoundingClientRect();
    return { width: Math.round(width), height: Math.round(height) };
  });

  let width = (item as ImageItem)?.cropParams
    ? contentDimensions.width
    : item && item?.width
      ? item.width
      : contentDimensions.width;
  let height = (item as ImageItem)?.cropParams
    ? contentDimensions.height
    : item && item?.height
      ? item.height
      : contentDimensions.height;

  width = Math.round(width);
  height = Math.round(height);

  const clip = {
    x: 0,
    y: 0,
    width: width,
    height: height,
  };

  const fileName = `${randomUUID()}.png`;
  const outputPath = path.join(tempDir, fileName);
  await page.screenshot({
    omitBackground: true,
    clip,
    path: outputPath,
  });

  return {
    src: outputPath,
    width,
    height,
  };
}
