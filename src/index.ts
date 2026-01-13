import path from 'path';
import { Project } from './types/items.type';
import configInstance from './lib/config/config';
import PuppeteerManager from './utils/puppeteerManager';

import { ErrorFactory, ErrorHandler } from './errors';

import { FilterComplexScript } from './utils/ffmpeg/filterComplexScript';
import { createBaseFfmpegCommand } from './utils/ffmpeg/baseCommand';
import { buildOutputOptions } from './utils/ffmpeg/outputOptions';
import { runFfmpeg } from './utils/ffmpeg/runFfmpeg';

import {
  extractProjectDefaults,
  safeInitializeElements,
  safeSetupConfig,
  safeValidateFormat,
} from './utils/project';

import { safeStatSizeSync } from './utils/fs';

import { buildVideoFiltergraph } from './utils/pipeline/videoFiltergraph';
import {
  registerAudioFiltergraph,
  registerSubtitlesFiltergraph,
  registerThumbnailInput,
  registerVisualInputs,
} from './utils/pipeline/register';

type RenderVideoResult = {
  localPath: string;
  fileName: string;
  duration: number;
  fileSize: number;
  thumbnail?: any;
};

export default function renderVideo(
  project: any,
  outputFolder: string,
  progress?: (percentage: number) => void
) {
  return ErrorHandler.wrapAsyncFunction(async () => {
    ErrorFactory.validateProject(project);

    const puppeteerManager = PuppeteerManager.getInstance();
    await puppeteerManager.startRenderSession();

    await safeSetupConfig(project);

    const defaults = extractProjectDefaults(project);
    const { width, height } = configInstance.getConfig();

    const projectWithDefaults = {
      ...project,
      visuals: defaults.visuals,
      audios: defaults.audios,
      duration: defaults.duration,
    };

    const normalizedProject = await safeInitializeElements(
      projectWithDefaults,
      defaults.subtitle
    );

    const validatedFormat = safeValidateFormat(defaults.outputFormat);

    const ffmpegCommand = createBaseFfmpegCommand({
      backgroundColor: defaults.backgroundColor,
      width,
      height,
      frameRate: defaults.frameRate,
      duration: defaults.duration,
    });

    const items = defaults.visuals;
    const { videoFilters, finalVideoLabel } = buildVideoFiltergraph(items);

    const videoSpecificAudioFilters = await registerVisualInputs(
      ffmpegCommand,
      items
    );

    const thumbnailInputIndex = registerThumbnailInput(
      ffmpegCommand,
      defaults.thumbnail,
      items.length
    );

    const audioInputStartIndex =
      1 + items.length + (defaults.thumbnail ? 1 : 0);
    const audioFilters = await registerAudioFiltergraph({
      command: ffmpegCommand,
      audios: defaults.audios,
      videoSpecificAudioFilters,
      audioInputStartIndex,
      project: normalizedProject as Project,
    });

    const { subtitlesFilters, mappedVideoLabel } =
      await registerSubtitlesFiltergraph({
        command: ffmpegCommand,
        subtitle: defaults.subtitle,
        finalVideoLabel,
      });

    const complexFilters: any[] = [
      ...(videoFilters || []),
      ...(subtitlesFilters || []),
      ...(audioFilters || []),
    ].filter(Boolean);

    const usesComplexFilter = complexFilters.length > 0;
    const totalFramesNumber = Math.max(
      1,
      defaults.duration * defaults.frameRate
    );

    const outputOptions = buildOutputOptions({
      usesComplexFilter,
      mappedVideoLabel,
      duration: defaults.duration,
      audioFilters,
      thumbnailInputIndex,
    });

    const outputFileName = `${defaults.name}.${validatedFormat}`;
    const outputPath = path.join(outputFolder, outputFileName);

    const filterScript = new FilterComplexScript();

    try {
      if (usesComplexFilter) {
        filterScript.attach(ffmpegCommand, complexFilters);
      }
    } catch (e) {
      filterScript.cleanup();
      throw e;
    }

    return runFfmpeg<RenderVideoResult>({
      command: ffmpegCommand,
      outputPath,
      outputOptions,
      totalFramesNumber,
      progress,
      puppeteerManager,
      onCleanup: () => filterScript.cleanup(),
      onSuccess: async () => {
        const fileSize = safeStatSizeSync(outputPath);

        const result: RenderVideoResult = {
          localPath: outputPath,
          fileName: outputFileName,
          duration: defaults.duration,
          fileSize,
        };

        return result;
      },
    });
  }, 'renderVideo')();
}
