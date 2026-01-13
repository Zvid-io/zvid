import { FfmpegCommand, FilterSpecification } from 'fluent-ffmpeg';
import { AudioItem, Project } from '../../types/items.type';
import sortItemsByTrackAndStartTime from '../initialization/sortItemsByTrack';

export default async function registerAudioInputs(
  ffmpegCommand: FfmpegCommand,
  audioElements: AudioItem[],
  videoAudioFilters: FilterSpecification[],
  startIngIndex: number,
  project: Project
) {
  const audioFilters = [...videoAudioFilters];
  sortItemsByTrackAndStartTime(audioElements, 'AUD');

  audioElements.forEach((audio, index) => {
    let {
      src,
      enter = 0,
      exit,
      audioBegin = 0,
      audioEnd,
      volume,
      speed = 1,
    } = audio;
    if (audioEnd === undefined) {
      audioEnd = project.duration as number;
    }

    // Calculate the original audio duration
    const originalAudioDuration = audioEnd - audioBegin;

    // Calculate the timeline duration (how long the audio should play in the timeline)
    let timelineDuration = originalAudioDuration;
    if (exit !== undefined && exit > enter) {
      timelineDuration = exit - enter;
    }

    // Calculate the actual audio duration after speed adjustment
    const adjustedAudioDuration = originalAudioDuration / speed;

    const delay = enter * 1000;
    const inputNum = index + startIngIndex;

    ffmpegCommand
      .input(src)
      .inputOption('-stream_loop -1')
      .seekInput(audioBegin);

    // Build audio filter string with speed, exit, and looping support
    let audioFilterString = `atrim=0:${originalAudioDuration}`;

    // Add speed control if speed is not 1
    if (speed !== 1) {
      audioFilterString += `,atempo=${speed}`;
    }

    // Add looping if adjusted audio duration is less than timeline duration
    if (adjustedAudioDuration < timelineDuration) {
      // Calculate how many loops we need
      const loopCount = Math.ceil(timelineDuration / adjustedAudioDuration);
      audioFilterString += `,aloop=loop=${loopCount - 1}:size=2e+09`;
    }

    // Trim to exact timeline duration and add volume/delay
    audioFilterString += `,atrim=0:${timelineDuration},volume=${volume},adelay=${delay}|${delay}`;

    audioFilters.push({
      filter: audioFilterString,
      inputs: `[${inputNum}:a]`,
      outputs: `outa-${inputNum}`,
    });
  });

  if (audioFilters.length >= 2) {
    const audioStreams = audioFilters.map(({ outputs }) => `${outputs}`);

    audioFilters.push({
      filter: 'amix',
      options: `inputs=${audioStreams.length}:normalize=0`,
      inputs: audioStreams,
      outputs: 'outa',
    });
  } else if (audioFilters.length === 1) {
    audioFilters.push({
      filter: 'acopy',
      inputs: `${audioFilters[0].outputs}`,
      outputs: 'outa',
    });
  }

  return audioFilters;
}
