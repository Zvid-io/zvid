import { Item, Project } from '../types/items.type';
import setupVideoConfig from '../lib/initialization/setupConfig';
import initializeElements from '../lib/initialization/initializeElements';
import { validateAndNormalizeFormat } from './formatValidator';
import { ConfigurationError, ErrorHandler } from '../errors';

export type ProjectDefaults = {
  audios: any[];
  visuals: any[];
  thumbnail?: string;
  frameRate: number;
  name: string;
  duration: number;
  backgroundColor: string;
  outputFormat: string;
  subtitle?: any;
};

export function extractProjectDefaults(project: any): ProjectDefaults {
  let {
    audios = [],
    visuals = [],
    thumbnail,
    frameRate = 30,
    name = 'unnamed',
    duration = 10,
    backgroundColor = '#ffffff',
    outputFormat = 'mp4',
    subtitle,
  } = project || {};

  visuals = visuals.map((v: Item) => {
    return {
      ...v,
      type: v.type.toUpperCase(),
    };
  });

  return {
    audios,
    visuals,
    thumbnail,
    frameRate,
    name,
    duration,
    backgroundColor,
    outputFormat,
    subtitle,
  };
}

export async function safeSetupConfig(project: any): Promise<void> {
  try {
    await setupVideoConfig(project);
  } catch (error) {
    throw ErrorHandler.wrapError(error, 'setupVideoConfig');
  }
}

export async function safeInitializeElements(
  projectWithDefaults: any,
  subtitle: any
): Promise<Project> {
  try {
    return (await initializeElements(projectWithDefaults, subtitle)) as Project;
  } catch (error) {
    throw ErrorHandler.wrapError(error, 'initializeElements');
  }
}

export function safeValidateFormat(outputFormat: string): string {
  try {
    return validateAndNormalizeFormat(outputFormat);
  } catch (error) {
    throw ConfigurationError.invalidOutputFormat(
      outputFormat,
      undefined,
      error as Error
    );
  }
}
