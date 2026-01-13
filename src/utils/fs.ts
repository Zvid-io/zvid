import fs from 'fs';

export function safeUnlinkSync(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
  } catch {
    // ignore
  }
}

export function safeStatSizeSync(filePath: string): number {
  try {
    return fs.statSync(filePath).size;
  } catch (error) {
    console.warn('Could not get video file size:', error);
    return 0;
  }
}
