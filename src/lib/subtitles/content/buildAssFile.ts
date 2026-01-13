import type { Caption, Subtitle, Word } from '../../../types/text';
import {
  calculateKaraokeTime,
  formatASSTime,
  transformTextCase,
} from '../../../utils/subtitles';
import generateHeader from './generateHeader';
import { writeFile } from 'fs/promises';
import PuppeteerManager from '../../../utils/puppeteerManager';
import path from 'path';
import configInstance from '../../config/config';
import downloadGoogleFont from '../../../utils/downloadGoogleFont';
import { GlobalFonts } from '@napi-rs/canvas';
import { generateASSContent as generateASSContentWordByWord } from '../modes/subtitle-one-word';
import { generateASSContent as generateASSContentSentenceByWord } from '../modes/subtitle-progressive';
import { generateASSContent as generateASSContentKaraoke } from '../modes/subtitle-karaoke';

export async function buildAssFile(subtitle: Subtitle) {
  // 🔹 New structure: styles + effects + bgEffects + captions at top-level)
  const { styles = {}, captions = [] } = subtitle as Subtitle;
  const { width: projectWidth, height: projectHeight } =
    configInstance.getConfig();

  // default marginVertically is 5% of project height, but can be overridden by marginV
  styles.marginV = Math.round(styles.marginV || projectHeight * 0.05);
  // default marginHorizontally is 5% of project width, but can be overridden by marginH
  styles.marginH = Math.round(styles.marginH || projectWidth * 0.05);
  styles.color = styles.color || '#ffffff';
  styles.fontSize = styles.fontSize || 50;
  styles.fontFamily = styles.fontFamily || 'Poppins';
  subtitle.styles = styles;

  const { textTransform, mode, marginH, marginV } = styles || {};

  const assHeader = generateHeader(styles);

  let transformedCaptions = captions;
  transformedCaptions = captions.map((sentence: Caption) => {
    return {
      ...sentence,
      text: transformTextCase(sentence, textTransform),
    };
  });

  let assBody;

  if (mode === 'one-word') {
    assBody = generateASSContentWordByWord(subtitle);
  } else if (mode === 'progressive') {
    assBody = generateASSContentSentenceByWord(subtitle);
  } else if (mode === 'karaoke') {
    assBody = generateASSContentKaraoke(subtitle);
  } else {
    assBody = transformedCaptions
      .map((caption: any) => {
        const start = formatASSTime(caption.start);
        const end = formatASSTime(caption.end);

        return `Dialogue: 0,${start},${end},Default,,${marginH},${marginH},${marginV},,${caption.text}`;
      })
      .join('\n');
  }

  const fullAss = `${assHeader}${assBody}`;

  try {
    const tempDir = await PuppeteerManager.getInstance().getTempDirectory();
    await writeFile(path.join(`${tempDir}/subtitles.ass`), fullAss, {
      encoding: 'ascii',
    });
  } catch (error) {
    console.error(`Error: ${error}`);
    throw error;
  }

  return fullAss;
}
