import type * as CSS from 'csstype';
import { Subtitle } from './text';

export type ResolutionPreset =
  | 'sd'
  | 'hd'
  | 'full-hd'
  | 'squared'
  | 'youtube-short'
  | 'youtube-video'
  | 'tiktok'
  | 'instagram-reel'
  | 'instagram-post'
  | 'instagram-story'
  | 'instagram-feed'
  | 'twitter-landscape'
  | 'twitter-portrait'
  | 'twitter-square'
  | 'facebook-video'
  | 'facebook-story'
  | 'facebook-post'
  | 'snapshat'
  | 'custom';

export interface ResolutionDimensions {
  width: number;
  height: number;
}

export type PositionPreset =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center-center'
  | 'center-right'
  | 'bottom-right'
  | 'bottom-center'
  | 'bottom-left'
  | 'custom';

export type ResizeMode = 'contain' | 'cover';

export type Item = VideoItem | ImageItem | GIFItem | TextItem | SVGItem;

type XFadeEffect =
  | 'fade'
  | 'fadeblack'
  | 'fadewhite'
  | 'distance'
  | 'wipeleft'
  | 'wiperight'
  | 'wipeup'
  | 'wipedown'
  | 'slideleft'
  | 'slideright'
  | 'slideup'
  | 'slidedown'
  | 'smoothleft'
  | 'smoothright'
  | 'smoothup'
  | 'smoothdown'
  | 'circlecrop'
  | 'rectcrop'
  | 'circleclose'
  | 'circleopen'
  | 'horzclose'
  | 'horzopen'
  | 'vertclose'
  | 'vertopen'
  | 'diagbl'
  | 'diagbr'
  | 'diagtl'
  | 'diagtr'
  | 'hlslice'
  | 'hrslice'
  | 'vuslice'
  | 'vdslice'
  | 'dissolve'
  | 'pixelize'
  | 'radial'
  | 'hblur'
  | 'wipetl'
  | 'wipetr'
  | 'wipebl'
  | 'wipebr'
  | 'fadegrays'
  | 'zoomin'
  | 'hlwind'
  | 'hrwind';

export type Anchor =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center-center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ImageItem {
  enterEnd?: number;
  exitBegin?: number;
  src: string;
  width?: number;
  height?: number;
  enterBegin?: number;
  opacity?: number;
  inputNumber?: number;
  track?: number;
  cropParams?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  angle?: number;
  enterAnimation?: string | null;
  flipV?: boolean;
  flipH?: boolean;
  x?: number;
  filter?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    'hue-rotate'?: string;
    blur?: string;
    invert?: boolean | number;
    colorTint?: string;
  };
  y?: number;
  type: string;
  exitAnimation?: string | null;
  exitEnd?: number;
  chromaKey?: { color: string; similarity?: number; blend?: number };
  radius?: {
    br: number;
    tl: number;
    bl: number;
    tr: number;
  };
  position?: PositionPreset;
  resize?: ResizeMode;
  zoom?: boolean;
  anchor?: Anchor;
}

export interface GIFItem {
  enterEnd?: number;
  exitBegin?: number;
  src: string;
  width?: number;
  height?: number;
  enterBegin?: number;
  opacity?: number;
  inputNumber?: number;
  track?: number;
  cropParams?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  angle?: number;
  enterAnimation?: string | null;
  flipV?: boolean;
  flipH?: boolean;
  x?: number;
  y?: number;
  type: 'GIF';
  exitAnimation?: string | null;
  exitEnd?: number;
  position?: PositionPreset;
  resize?: ResizeMode;
  zoom?: boolean;
  anchor?: Anchor;
}

export interface VideoItem extends ImageItem {
  videoEnd?: number;
  videoBegin?: number;
  videoDuration?: number;
  volume?: number;
  speed?: number;
  transition?: XFadeEffect | null;
  transitionDuration?: number;
  transitionId?: string | null;
  frameRate?: number;
  id?: string;
  hasAudio?: boolean;
}

export interface ContainerStyle {
  textAlign?: 'center' | 'left' | 'right';
  fontFamily?: string;
  fontSize?: string;
  letterSpacing?: string;
  textTransform?: string;
  textDecoration?: string;
  color?: string;
  lineHeight?: number;
  margin?: string;
}

export interface TextItem {
  exitEnd?: number;
  type: 'TEXT';
  exitBegin?: number;
  exitAnimation?: string | null;
  enterAnimation?: string | null;
  style?: CSS.Properties;
  html?: string;
  text?: string;
  enterEnd?: number;
  angle?: number;
  track?: number;
  height?: number;
  enterBegin?: number;
  flipV?: boolean;
  flipH?: boolean;
  width?: number;
  x?: number;
  y?: number;
  opacity?: number;
  inputNumber?: number;
  imageSrc?: string;
  position?: PositionPreset;
  anchor?: Anchor;
}

export interface AudioItem {
  src: string;
  exit?: number;
  enter?: number;
  volume?: number;
  speed?: number;
  audioEnd?: number;
  audioDuration?: number;
  audioBegin?: number;
  track?: number; // Added based on the defaults table
}

export interface SVGItem {
  type: 'SVG';
  svg: string;
  imageSrc?: string;
  enterEnd?: number;
  exitBegin?: number;
  width?: number;
  height?: number;
  enterBegin?: number;
  opacity?: number;
  inputNumber?: number;
  track?: number;
  angle?: number;
  enterAnimation?: string | null;
  flipV?: boolean;
  flipH?: boolean;
  x?: number;
  y?: number;
  filter?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    'hue-rotate'?: string;
    blur?: string;
    invert?: boolean | number;
    colorTint?: string;
  };
  exitAnimation?: string | null;
  exitEnd?: number;
  chromaKey?: { color: string; similarity?: number; blend?: number };
  position?: PositionPreset;
  resize?: ResizeMode;
  anchor?: Anchor;
}

export interface Project {
  thumbnail?: string;
  visuals?: Item[];
  backgroundColor?: string;
  name?: string;
  width?: number;
  audios?: AudioItem[];
  height?: number;
  duration?: number;
  frameRate?: number;
  outputFormat?: string;
  resolution?: ResolutionPreset;
  subtitle?: Subtitle;
}
