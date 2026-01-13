import { FfmpegCommand } from 'fluent-ffmpeg';
import registerVisuals from '../../lib/videos/registerVisualInputs';
import registerAudioInputs from '../../lib/audio/registerAudioInputs';
import registerSubtitlesInputs from '../../lib/subtitles/registerSubtitlesInputs';
import { Project } from '../../types/items.type';
import { ErrorHandler } from '../../errors';

export async function registerVisualInputs(
  command: FfmpegCommand,
  items: any[]
): Promise<any[]> {
  try {
    const res = await registerVisuals(command, items);
    return Array.isArray(res) ? res : [];
  } catch (error) {
    throw ErrorHandler.wrapError(error, 'registerVisuals');
  }
}

export function registerThumbnailInput(
  command: FfmpegCommand,
  thumbnail: string | undefined,
  itemsLength: number
): number | null {
  if (!thumbnail) return null;

  const thumbnailInputIndex = 1 + itemsLength;
  console.log(
    `Adding thumbnail from ${thumbnail} as input ${thumbnailInputIndex}`
  );
  command.input(thumbnail);

  return thumbnailInputIndex;
}

export async function registerAudioFiltergraph(params: {
  command: FfmpegCommand;
  audios: any[];
  videoSpecificAudioFilters: any[];
  audioInputStartIndex: number;
  project: Project;
}): Promise<any[]> {
  const {
    command,
    audios,
    videoSpecificAudioFilters,
    audioInputStartIndex,
    project,
  } = params;

  try {
    const res = await registerAudioInputs(
      command,
      audios,
      videoSpecificAudioFilters,
      audioInputStartIndex,
      project
    );
    return Array.isArray(res) ? res : [];
  } catch (error) {
    throw ErrorHandler.wrapError(error, 'registerAudioInputs');
  }
}

export async function registerSubtitlesFiltergraph(params: {
  command: FfmpegCommand;
  subtitle: any;
  finalVideoLabel: string;
}): Promise<{ subtitlesFilters: any[]; mappedVideoLabel: string }> {
  const { command, subtitle, finalVideoLabel } = params;

  if (!subtitle) {
    return { subtitlesFilters: [], mappedVideoLabel: finalVideoLabel };
  }

  try {
    const res = await registerSubtitlesInputs(command, finalVideoLabel);
    const subtitlesFilters = Array.isArray(res) ? res : [];
    return { subtitlesFilters, mappedVideoLabel: 'outv-subtitled' };
  } catch (error) {
    throw ErrorHandler.wrapError(error, 'registerSubtitlesInputs');
  }
}
