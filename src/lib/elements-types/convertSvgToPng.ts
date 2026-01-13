import sharp from 'sharp';
import { writeFile, readFile } from 'fs/promises';
import axios, { AxiosError } from 'axios';

type Item = {
  width: number;
  height: number;
  svgUrl: string;
};

export async function convertSvgToPng(
  { height, svgUrl, width }: Item,
  pngPath: string
) {
  try {
    const svgRes = await axios.get(svgUrl);
    const pngBuffer = await sharp(Buffer.from(svgRes.data))
      .resize(width, height)
      .png()
      .toBuffer();
    await writeFile(pngPath, pngBuffer);
  } catch (error: unknown) {
    error instanceof AxiosError
      ? console.log('Fetch Error: ', error.cause)
      : console.log('Conversion Error to svg: ', error);

    process.exit(1);
  }
}
