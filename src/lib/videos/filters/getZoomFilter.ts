// src/ffmpeg/filters/getZoomFilter.ts
import { FilterSpecification } from 'fluent-ffmpeg';
import { Item } from '../../../types';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getVisibleDurationSec(elem: any): number {
  // prefer (exitStart - enterEnd); fallbacks tolerate different field names
  const enter = elem.enterBegin ?? 0;
  const exit = elem.exitEnd ?? enter;
  const d = exit - enter;
  return d > 0 ? d : 0;
}

/**
 * Returns filters and the new output label after applying the zoom.
 * - Default fps 30 (stable and smooth)
 * - For videos/gifs, we normalize SAR and scale first to avoid jitter
 * - For images, zoompan makes a video of `d` frames
 */
export default function getZoomFilter(
  elem: Item,
  inputs: string,
  inputNumber: number
): { filters: FilterSpecification[]; output: string } {
  const cfg = (elem as any).zoom;
  if (!cfg) return { filters: [], output: inputs };

  const fps = 30;

  // Defaults
  let durationSec = getVisibleDurationSec(elem);
  let depth = 1.5;
  let xExpr = `iw/2-(iw/zoom/2)`;
  let yExpr = `ih/2-(ih/zoom/2)`;

  const totalFrames = Math.max(1, Math.round(durationSec * fps));

  const incr = (depth - 1) / totalFrames;
  const seq: FilterSpecification[] = [];
  let current = inputs;

  // IMPORTANT for videos: normalize SAR and scale before zoom to prevent jitter
  // normalize sample aspect ratio first
  seq.push({
    filter: 'setsar',
    options: '1',
    inputs: current,
    outputs: `sar1_${inputNumber}`,
  });
  current = `sar1_${inputNumber}`;

  // stabilize size (even if already covered, this is idempotent when dims match)
  const w = (elem as any).width;
  const h = (elem as any).height;
  if (w && h) {
    seq.push({
      filter: 'scale',
      options: `${w * 10}:${h * 10}:flags=bicubic`,
      inputs: current,
      outputs: `prezoom_scaled_${inputNumber}`,
    });
    current = `prezoom_scaled_${inputNumber}`;
  }

  // linear ramp 1 → depth over `totalFrames`
  seq.push({
    filter: 'zoompan',
    options: `z='min(max(zoom,pzoom)+${incr.toFixed(
      6
    )},${depth})':x='${xExpr}':y='${yExpr}':d=1:s=${elem.width}x${elem.height}`,
    inputs: current,
    outputs: `zoom_${inputNumber}`,
  });
  current = `zoom_${inputNumber}`;

  return { filters: seq, output: current };
}
