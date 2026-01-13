import sortItemsByTrackAndStartTime from './sortItemsByTrack';
import path from 'path';
import { Item, Project, AudioItem } from '../../types/items.type'; // Import AudioItem
import { checkIsSvg } from '../elements-types/checking';
import { convertSvgToPng } from '../elements-types/convertSvgToPng';
import roundItemsValues from './roundItemsValues';
import setupVideoConfig from './setupConfig';
import { applyVisualDefaults, applyAudioDefaults } from './applyItemDefaults'; // Import the new function
import setupSubtitles from './setupSubtitles';

export default async function initializeElement(
  project: Project,
  subtitle?: any
) {
  // Added duration and audios to project pick
  const items = project.visuals as unknown as Item[];
  const audios = project.audios as unknown as AudioItem[];

  subtitle && (await setupSubtitles(subtitle));

  // Apply defaults to visual items
  for (const item of items) {
    await applyVisualDefaults(item, project);
  }

  // Apply defaults to audio items
  for (const audioItem of audios) {
    await applyAudioDefaults(audioItem, project);
  }

  sortItemsByTrackAndStartTime(items, 'VID');
  items.forEach((item, inputNumber) => {
    roundItemsValues(item);
    // Add inputNumber to all items (including TEXT items for FFmpeg input referencing)
    item.inputNumber = inputNumber + 1;
  });

  project.visuals = items;
  project.audios = audios; // Update audios in project
  return project;
}
