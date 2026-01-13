import { FfmpegCommand, FilterSpecification } from 'fluent-ffmpeg';
import { ImageItem, Item, VideoItem, SVGItem } from '../../types/items.type';
import {
  checkIsGif,
  checkIsSvg,
  checkIsText,
  checkIsVideo,
} from '../elements-types/checking';
import applyImgModifications from '../images/applyImgModifications';

export default async function registerVisuals(
  ffmpegCommand: FfmpegCommand,
  visuals: Item[]
) {
  const audioFilters: FilterSpecification[] = [];

  for (let index = 0; index < visuals.length; index++) {
    const item = visuals[index];
    const { type } = item;
    const src = 'src' in item ? item.src : '';

    if (checkIsText(item)) {
      ffmpegCommand.input(item.imageSrc as string).loop(1);
    } else if (checkIsVideo(item)) {
      const {
        volume = 0,
        videoBegin,
        videoEnd,
        enterBegin,
        exitEnd,
        inputNumber,
        speed,
        hasAudio,
      } = item as VideoItem;

      const duration = (videoEnd as number) - (videoBegin as number);

      ffmpegCommand
        .input(src)
        .inputOptions([`-ss ${videoBegin}`, `-t ${duration}`]);

      if (volume > 0 && hasAudio) {
        const audioDelay = (enterBegin as number) * 1000;
        let audioFilterString =
          speed && speed !== 1
            ? `volume=${volume},atempo=${speed},adelay=${audioDelay}|${audioDelay},atrim=0:${exitEnd}`
            : `volume=${volume},adelay=${audioDelay}|${audioDelay},atrim=0:${exitEnd}`;

        audioFilters.push({
          filter: audioFilterString,
          inputs: `[${inputNumber}:a]`,
          outputs: `outa-${inputNumber}`,
        });
      }
    } else if (checkIsGif(item)) {
      const { enterBegin, exitEnd } = item;
      const duration = (exitEnd as number) - (enterBegin as number);

      ffmpegCommand
        .input(src)
        .inputOptions(['-ignore_loop 0']) // Ignore the loop count in the GIF file
        .inputOptions([`-t ${duration}`])
        .inputOptions([`-itsoffset ${enterBegin}`]);
    } else if (/ima?ge?/i.test(type)) {
      const screenshotPath = await applyImgModifications(item as ImageItem);
      ffmpegCommand.input(screenshotPath).loop(1);
    } else if (checkIsSvg({ type } as Item)) {
      ffmpegCommand.input((item as SVGItem).imageSrc as string).loop(1);
    }
  }

  return audioFilters;
}
