import { fileTypeFromFile } from 'file-type';
import mimeTypes from 'mime-types';
import fs from 'fs';

async function detectMime(localPath: string) {
  // Best sniffing first (bytes-based)
  const ft = await fileTypeFromFile(localPath);
  if (ft?.mime) return ft.mime;

  // Fallback: extension-based
  const byExt = mimeTypes.lookup(localPath);
  if (byExt) return byExt;

  // Last resort
  return 'application/octet-stream';
}

export async function fileToDataUrl(src: string) {
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  const localPath = src;
  const mime = await detectMime(localPath);

  const buf = await fs.promises.readFile(localPath);
  const b64 = buf.toString('base64');
  return `data:${mime};base64,${b64}`;
}
