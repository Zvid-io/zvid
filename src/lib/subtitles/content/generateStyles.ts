import type { SubtitleStyles } from '../../../types/text';

const convertColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const a = parseInt(hex.slice(7, 9), 16) || '';
  return `&H${a.toString(16).padStart(2, '0')}${b
    .toString(16)
    .padStart(2, '0')}${g.toString(16).padStart(2, '0')}${r
    .toString(16)
    .padStart(2, '0')}`;
};

function mapPositionToASS(pos: Pick<SubtitleStyles, 'position'>['position']) {
  const map = {
    'top-left': 7,
    'top-center': 8,
    'top-right': 9,
    'center-left': 4,
    'center-center': 5,
    'center-right': 6,
    'bottom-left': 1,
    'bottom-center': 2,
    'bottom-right': 3,
  };
  return pos ? map[pos] : 2;
}

export default function generateStyles(
  styles: SubtitleStyles,
  isHighlight?: boolean
) {
  const {
    fontFamily: fontName,
    fontSize,
    outline,
    background,
    activeWord,
    color,
    isBold,
    isItalic,
  } = styles;
  const name = isHighlight ? 'Highlight' : 'Default';
  const position = mapPositionToASS(styles.position);

  const primaryColor =
    isHighlight && activeWord && activeWord.color
      ? convertColor(activeWord.color)
      : convertColor(color as string);

  // ---- BACKGROUND HANDLING ----
  const hasBackground = !!background;

  // BackColour → THIS is the opaque box fill when BorderStyle = 3
  const backColor = hasBackground
    ? convertColor(background)
    : convertColor('#00000000'); // fully transparent box when background "transparent"

  const defaultStyles = [
    name, // Name
    fontName, // Fontname
    fontSize, // Fontsize
    primaryColor, // PrimaryColour
    convertColor('#00000000'), // SecondaryColour (unused, keep transparent)
    hasBackground || !outline
      ? convertColor('#00000000')
      : convertColor(outline.color), // OutlineColour
    backColor, // BackColour (BOX FILL!)
    isBold ? 1 : 0, // Bold
    isItalic ? 1 : 0, // Italic
    0, // Underline
    0, // StrikeOut
    100, // ScaleX
    100, // ScaleY
    0, // Spacing
    0, // Angle
    hasBackground ? 3 : 1, // BorderStyle → 3 = Opaque Box ✅
    hasBackground || !outline ? 0 : outline.width, // Outline (border thickness; 0 is fine for tight box)
    hasBackground ? 1 : 0, // Shadow
    position, // Alignment
    0, // MarginL
    0, // MarginR
    0, // MarginV
    1, // Encoding
  ];

  return defaultStyles;
}
