import { FfmpegCommand } from 'fluent-ffmpeg';
import PuppeteerManager from '../../utils/puppeteerManager';
import path from 'path';

export default async function registerSubtitlesInputs(
  ffmpegCommand: FfmpegCommand,
  videoFiltersOuputLabel: string
) {
  const puppeteerManager = PuppeteerManager.getInstance();
  const tempDir = await puppeteerManager.getTempDirectory();

  const src = path
    .join(`${tempDir}/subtitles.ass`)
    .replace(/\\/g, '/')
    .replace(/:/g, '\\\\:');

  const fontsDir = path
    .join(tempDir)
    .replace(/\\/g, '/')
    .replace(/:/g, '\\\\:');

  // ffmpegCommand.input(src);

  return [
    {
      filter: `subtitles`,
      options: `${src}:fontsdir=${fontsDir}`,
      inputs: `${videoFiltersOuputLabel}`,
      outputs: 'outv-subtitled',
    },
  ];
}
