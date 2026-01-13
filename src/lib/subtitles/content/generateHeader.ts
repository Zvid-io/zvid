import { SubtitleStyles } from '../../../types/text';
import configInstance from '../../config/config';
import generateStyles from './generateStyles';

export default function generateHeader(styles: SubtitleStyles) {
  const { mode } = styles;
  const hasMode = mode === 'progressive' || mode === 'karaoke';
  const defaultStyleValues = generateStyles(styles, false);
  let highlightStyleValues = '';
  if (hasMode) {
    highlightStyleValues = `Style: ${generateStyles(styles, true).join(',')}`;
  }
  const { width, height } = configInstance.getConfig();

  const assHeader = `
[Script Info]
Title: Generated Subtitles
ScriptType: v4.00+
Collisions: Normal
PlayDepth: 0
PlayResX: ${width}
PlayResY: ${height}

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: ${defaultStyleValues.join(',')}
${highlightStyleValues}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  return assHeader;
}
