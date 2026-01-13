import ffmpeg, { FfmpegCommand } from 'fluent-ffmpeg';
import { ErrorFactory } from '../../errors';

export function createBaseFfmpegCommand(params: {
  backgroundColor: string;
  width: number;
  height: number;
  frameRate: number;
  duration: number;
}): FfmpegCommand {
  const { backgroundColor, width, height, frameRate, duration } = params;

  try {
    return ffmpeg()
      .input(
        `color=c=${backgroundColor}:s=${width}x${height}:r=${frameRate}:d=${duration}`
      )
      .inputFormat('lavfi');
  } catch {
    throw ErrorFactory.ffmpegError(
      undefined,
      undefined,
      'creating FFmpeg command'
    );
  }
}
