import sharp from 'sharp';
import { SVGItem } from '../../types/items.type';
import { writeFile } from 'fs/promises';
import PuppeteerManager from '../../utils/puppeteerManager';
import { randomUUID } from 'crypto';
import path from 'path';

function parseSvgDimensions(svg: string): {
  width?: number;
  height?: number;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
} {
  const widthMatch = svg.match(/\bwidth="([^"]+)"/);
  const heightMatch = svg.match(/\bheight="([^"]+)"/);
  const viewBoxMatch = svg.match(/\bviewBox="([^"]+)"/);

  const parseSize = (value?: string | null): number | undefined => {
    if (!value) return undefined;
    const num = value.match(/([\d.]+)/);
    return num ? parseFloat(num[1]) : undefined;
  };

  const width = parseSize(widthMatch?.[1]);
  const height = parseSize(heightMatch?.[1]);

  let viewBoxWidth: number | undefined;
  let viewBoxHeight: number | undefined;

  if (viewBoxMatch?.[1]) {
    const parts = viewBoxMatch[1].trim().split(/\s+/);
    if (parts.length === 4) {
      viewBoxWidth = parseFloat(parts[2]);
      viewBoxHeight = parseFloat(parts[3]);
    }
  }

  return { width, height, viewBoxWidth, viewBoxHeight };
}

export default async function constructSVG(svgItem: SVGItem) {
  const puppeteerManager = PuppeteerManager.getInstance();
  const tempDir = await puppeteerManager.getTempDirectory();

  const { svg } = svgItem;
  let { width, height } = svgItem;

  // 1) Parse intrinsic SVG dimensions (actual 100x100 in your case)
  const {
    width: svgWidth,
    height: svgHeight,
    viewBoxWidth,
    viewBoxHeight,
  } = parseSvgDimensions(svg);

  // 2) Decide the *logical* target width/height

  // Start from item width/height if provided
  let targetWidth = width;
  let targetHeight = height;

  // If not provided, use SVG's own width/height
  if (targetWidth == null && targetHeight == null) {
    if (svgWidth && svgHeight) {
      targetWidth = svgWidth;
      targetHeight = svgHeight;
    } else if (viewBoxWidth && viewBoxHeight) {
      targetWidth = viewBoxWidth;
      targetHeight = viewBoxHeight;
    }
  }

  // If only one dimension is missing, derive it from aspect ratio
  const intrinsicW = svgWidth || viewBoxWidth;
  const intrinsicH = svgHeight || viewBoxHeight;

  if (intrinsicW && intrinsicH) {
    const aspect = intrinsicH / intrinsicW;

    if (targetWidth != null && targetHeight == null) {
      targetHeight = Math.round(targetWidth * aspect);
    } else if (targetHeight != null && targetWidth == null) {
      targetWidth = Math.round(targetHeight / aspect);
    }
  }

  // Final fallback if everything failed
  if (targetWidth == null) targetWidth = 100;
  if (targetHeight == null) targetHeight = 100;

  // 3) Rasterize SVG → PNG at high quality
  // density: higher = more detail before resize; 300 is usually plenty.
  const pngBuffer = await sharp(Buffer.from(svg), {
    density: 300,
  })
    .resize(targetWidth, targetHeight) // ensure output exactly matches logical size
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .toBuffer();

  // 4) Save PNG to a temporary file
  const fileName = `${randomUUID()}.png`;
  const outputPath = path.join(tempDir, fileName);
  await writeFile(outputPath, pngBuffer);

  return {
    src: outputPath,
    width: targetWidth,
    height: targetHeight,
  };
}
