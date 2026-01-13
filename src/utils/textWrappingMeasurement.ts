import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'path';
import fs from 'fs';
import { TextObject, StrokeOptions, BackgroundOptions } from '../types/text';

// Font registration (assuming this part works as in the previous version)
const fontPath = path.join(__dirname, '../../assets/Poppins-Regular.ttf');
try {
  if (fs.existsSync(fontPath)) {
    const ok = GlobalFonts.registerFromPath(fontPath, 'Poppins');
    if (ok) {
      console.log('Poppins font registered successfully');
    } else {
      console.error('Failed to register Poppins font from:', fontPath);
    }
  } else {
    console.error('Font file not found:', fontPath);
  }
} catch (err) {
  console.error('Error registering font:', err);
}

function measureText(text: string, fontSize: number, fontFamily: string) {
  const canvas = createCanvas(1, 1);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  ctx.font = `${fontSize}px "${fontFamily}"`;
  return ctx.measureText(text).width;
}

function wrapText(
  text: string,
  containerWidth: number,
  fontSize: number,
  fontFamily: string,
  paddingLeft: number = 0,
  paddingRight: number = 0
) {
  const words = text.split(/\s+/);
  const maxWidth = containerWidth - paddingLeft - paddingRight;
  const lines: string[] = [];
  let currentLine: string[] = [];

  for (const word of words) {
    currentLine.push(word);
    const lineWidth = measureText(currentLine.join(' '), fontSize, fontFamily);

    if (lineWidth > maxWidth) {
      if (currentLine.length > 1) {
        lines.push(currentLine.slice(0, -1).join(' '));
        currentLine = [word];
      } else {
        lines.push(word);
        currentLine = [];
      }
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }

  return lines;
}

export function texts(
  text: string,
  containerWidth: number,
  fontSize: number,
  fontFamily: string,
  lineHeight: number,
  firstLineY: number,
  containerX: number,
  textAlignment: 'left' | 'center' | 'right',
  paddingLeft: number = 0,
  paddingRight: number = 0
) {
  const wrappedLines = wrapText(
    text,
    containerWidth,
    fontSize,
    fontFamily,
    paddingLeft,
    paddingRight
  );

  return wrappedLines.map((line, index) => ({
    text: line,
    y: firstLineY + index * lineHeight,
    width: measureText(line, fontSize, fontFamily),
  }));
}

export function generateFFmpegDrawTextCommands(
  textObjects: TextObject[],
  fontSize: number,
  fontFamily: string,
  fontColor: string,
  containerWidth: number,
  containerX: number,
  textAlignment: 'left' | 'center' | 'right',
  paddingLeft: number = 0,
  paddingRight: number = 0,
  stroke?: StrokeOptions,
  background?: BackgroundOptions
) {
  const fontFile = fontPath.replace(/\\/g, '/'); // Ensure forward slashes for FFmpeg

  return textObjects
    .map(({ text, y, width }) => {
      let x;
      switch (textAlignment) {
        case 'left':
          x = `${containerX} + ${paddingLeft}`;
          break;
        case 'center':
          x = `${containerX} + (${containerWidth} - ${width}) / 2`;
          break;
        case 'right':
          x = `${containerX} + ${containerWidth} - ${width} - ${paddingRight}`;
          break;
        default:
          x = `${containerX} + ${paddingLeft}`; // Default to left alignment
      }

      return `drawtext=text='${text.replace(/'/g, "'\\''")}': \
fontfile='${fontFile}': \
fontsize=${fontSize}: \
fontcolor=${fontColor}: \
x=${x}: \
y=${y}${
        stroke ? `: \ borderw=${stroke.width}:bordercolor=${stroke.color}` : ''
      }${
        background
          ? `: \ box=1:boxcolor=${background.color}@${background.opacity}:boxborderw=${background.width}`
          : ''
      }`;
    })
    .join(',');
}

// Example usage
// TODO dealing with special characters in text.
const text =
  'This is a long text that may wrap depending on the container width. It includes some longer words to test the wrapping algorithm more thoroughly.';
const containerWidth = 954;
const containerX = 960 - 14; // 14 pixels for the container edge width
const fontSize = 45.6;
const fontFamily = 'Poppins';
const lineHeight = 75.7;
const firstLineY = 540 + (lineHeight - fontSize) / 2;
const textAlignment = 'right'; // Can be 'left', 'center', or 'right'
const paddingLeft = 0;
const paddingRight = 0;
const fontColor = 'white';

const textObjects = texts(
  text,
  containerWidth,
  fontSize,
  fontFamily,
  lineHeight,
  firstLineY,
  containerX,
  textAlignment,
  paddingLeft,
  paddingRight
);

console.log('Text objects:');
console.log(JSON.stringify(textObjects, null, 2));

// FFmpeg drawtext command generation
const ffmpegDrawTextCommands = generateFFmpegDrawTextCommands(
  textObjects,
  fontSize,
  fontFamily,
  fontColor,
  containerWidth,
  containerX,
  textAlignment,
  paddingLeft,
  paddingRight
);

console.log('\nFFmpeg drawtext commands:');
console.log(ffmpegDrawTextCommands);

// Example of how to use the generated commands in a full FFmpeg command
const inputVideo = 'input.mp4';
const outputVideo = 'output.mp4';
const ffmpegCommand = `ffmpeg -i ${inputVideo} -vf "${ffmpegDrawTextCommands}" ${outputVideo}`;

console.log('\nFull FFmpeg command:');
console.log(ffmpegCommand);
