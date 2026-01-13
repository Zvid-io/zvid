import { FfmpegCommand } from 'fluent-ffmpeg';
import PuppeteerManager from '../puppeteerManager';
import { MediaProcessingError } from '../../errors';

export type ProgressCallback = (percentage: number) => void;

export function runFfmpeg<T>(params: {
  command: FfmpegCommand;
  outputPath: string;
  outputOptions: string[];
  totalFramesNumber: number;
  progress?: ProgressCallback;
  puppeteerManager: PuppeteerManager;
  onSuccess: () => Promise<T>;
  onCleanup: () => void;
}): Promise<T> {
  const {
    command,
    outputPath,
    outputOptions,
    totalFramesNumber,
    progress,
    puppeteerManager,
    onSuccess,
    onCleanup,
  } = params;

  return new Promise((resolve, reject) => {
    (command as any) // typings sometimes miss 'error' event
      .outputOptions(outputOptions)
      .output(outputPath)
      .on('start', (commandLine: string) => {
        console.log('FFmpeg command started:', commandLine);
      })
      .on('end', async () => {
        console.log('Video processing finished successfully');
        onCleanup();

        try {
          const result = await onSuccess();
          await puppeteerManager.cleanupTempDirectory();
          resolve(result);
        } catch (e) {
          await puppeteerManager.cleanupTempDirectory();
          reject(e);
        }
      })
      .on('error', async (err: Error, _stdout: string, stderr: string) => {
        onCleanup();

        const ffmpegError = MediaProcessingError.ffmpegFailed(
          undefined,
          stderr,
          err
        );
        await puppeteerManager.cleanupTempDirectory();
        reject(ffmpegError);
      })
      .on('progress', ({ frames }: { frames: number }) => {
        const percentage = Math.ceil((frames / totalFramesNumber) * 100);
        if (progress) progress(percentage);
      })
      .run();
  });
}
