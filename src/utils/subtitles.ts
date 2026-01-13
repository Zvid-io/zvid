import { Caption, Word } from '../types/text';

// Helper function to format time in ASS format (h:mm:ss.cs)
export function formatASSTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const centiseconds = Math.floor((seconds % 1) * 100);
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(
    centiseconds
  ).padStart(2, '0')}`;
}

// Helper function to calculate karaoke timing for ASS tags
export function calculateKaraokeTime(
  startTime: string,
  endTime: string
): number {
  const start = parseFloat(startTime);
  const end = parseFloat(endTime);
  return Math.round((end - start) * 100); // Returns time in centiseconds
}

export function transformTextCase(caption: Caption, textCase?: string) {
  let transformedText: string;
  let text = caption.text;
  if (!text) {
    text = caption.words
      .sort((a: Word, b: Word) => a.start - b.start)
      .reduce((acc: string, word: Word, index: number) => {
        return index === 0 ? word.text : acc + ' ' + word.text;
      }, '');
  }
  switch (textCase) {
    case 'capitalize':
      transformedText = text
        .split(' ')
        .map((word) => word.charAt(0).toLocaleUpperCase() + word.slice(1))
        .join(' ');
      break;
    case 'lowercase':
      transformedText = text.toLocaleLowerCase();
      break;
    case 'uppercase':
      transformedText = text.toLocaleUpperCase();
      break;
    default:
      transformedText = text;
      break;
  }

  return transformedText;
}

// ASS time format: h:mm:ss.cc (centiseconds)
export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    seconds = 0;
  }

  const totalCentiseconds = Math.round(seconds * 100);
  const cs = totalCentiseconds % 100;
  const totalSeconds = (totalCentiseconds - cs) / 100;

  const s = totalSeconds % 60;
  const totalMinutes = (totalSeconds - s) / 60;
  const m = totalMinutes % 60;
  const h = (totalMinutes - m) / 60;

  const pad2 = (n: number) => String(n).padStart(2, '0');

  return `${h}:${pad2(m)}:${pad2(s)}.${pad2(cs)}`;
}
