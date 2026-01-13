import axios from 'axios';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import PuppeteerManager from './puppeteerManager';
import { ResourceError, ErrorFactory } from '../errors';
import { SubtitleStyles } from '../types/text';

function extractUrlFromCssFace(cssContent: string) {
  const match = cssContent.match(/url\((.*?)\)/);
  if (match && match[1]) {
    return match[1].replace(/['"]+/g, '');
  }

  throw ResourceError.fontDownloadFailed(
    'unknown',
    undefined,
    new Error('Font file URL not found in the CSS response.')
  );
}

export function buildGoogleFontUrl(
  options: Pick<SubtitleStyles, 'fontFamily'>
) {
  const { fontFamily } = options;

  const baseUrl = 'https://fonts.googleapis.com/css2';
  const encodedFontFamily = encodeURIComponent(fontFamily as string).replace(
    /%20/g,
    '+'
  );

  // Request all styles and weights (italics + normal, 100–900)
  const query = `family=${encodedFontFamily}:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap`;

  return `${baseUrl}?${query}`;
}

export default async function downloadGoogleFont(options: SubtitleStyles) {
  const puppeteerManager = PuppeteerManager.getInstance();
  const tempDir = await puppeteerManager.getTempDirectory();

  try {
    // Font Face CSS
    const url = buildGoogleFontUrl(options);
    const cssFontFaceResponse = await axios.get(url);

    // Actual Font File
    const fontFileUrl = extractUrlFromCssFace(
      cssFontFaceResponse.data.toString('utf8')
    );
    const fontFileContentResponse = await axios.get(fontFileUrl, {
      responseType: 'arraybuffer',
    });

    const filePath = path.join(tempDir, `${options.fontFamily}.ttf`);
    await writeFile(filePath, fontFileContentResponse.data);
  } catch (error: any) {
    if (error instanceof ResourceError) {
      throw error; // Re-throw our custom errors unchanged
    }

    // Wrap other errors appropriately
    if (error.code === 'ENOENT' || error.code === 'EACCES') {
      throw ErrorFactory.permissionError(tempDir, 'write font file');
    }

    if (error.response?.status) {
      throw ErrorFactory.networkError(
        error.config?.url || 'unknown',
        error.response.status
      );
    }

    throw ErrorFactory.fontDownloadError(
      options.fontFamily as string,
      undefined,
      error
    );
  }
}
