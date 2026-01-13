export interface Word {
  start: number;
  end: number;
  text: string;
}

export type Words = Word[];

export interface Caption {
  start: number;
  end: number;
  text?: string;
  words: Words;
}

export interface Subtitle {
  captions: Caption[];
  styles?: SubtitleStyles;
}

export interface TextObject {
  text: string;
  y: number;
  width: number;
}

export interface StrokeOptions {
  width: number;
  color: string;
}

export interface BackgroundOptions {
  color: string;
  opacity: number;
  width: number;
}

export interface SubtitleStyles {
  color?: string;
  background?: string;
  isBold?: boolean;
  isItalic?: boolean;
  fontSize?: number;
  fontFamily?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize';
  outline?: {
    width: number;
    color: string;
  };
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'center-center'
    | 'center-left'
    | 'center-right';
  marginV?: number;
  marginH?: number;
  mode?: 'normal' | 'one-word' | 'karaoke' | 'progressive';
  activeWord?: {
    color: string;
  };
}
