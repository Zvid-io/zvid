import { FilterSpecification } from 'fluent-ffmpeg';
import calcRangeMap from '../../../utils/calcRangeMap';
import { Item } from '../../../types';

export interface StyleFilterOptions {
  brightness?: number;
  contrast?: number;
  saturate?: number;
  'hue-rotate'?: string; // e.g., "90deg" or "90"
  blur?: string | number; // 0..100 (percent of shortest dim / 2)
  invert?: boolean | number; // 0..1 or boolean
  colorTint?: string; // "#rrggbb"
}

export default function getStyleFilters(
  filter: Record<string, any>,
  inputs: string,
  inputNumber: number,
  item: Item
): { filters: FilterSpecification[]; output: string } {
  const filters: FilterSpecification[] = [];
  let current = inputs;

  // If no style options are present, return early
  const hasStyle =
    filter?.brightness !== undefined ||
    filter?.contrast !== undefined ||
    filter?.saturate !== undefined ||
    (filter?.['hue-rotate'] !== undefined && filter['hue-rotate'] !== 0) ||
    (filter?.blur !== undefined && filter.blur !== 0) ||
    filter?.invert ||
    filter?.colorTint;

  if (!hasStyle) {
    return { filters, output: current };
  }

  // --- Ensure RGBA, then split into color + alpha (keep alpha safe) ---
  const fmtLbl = `fmt_${inputNumber}`;
  const colLbl = `col_${inputNumber}`;
  const aLbl = `a_${inputNumber}`;
  const apLbl = `ap_${inputNumber}`;

  filters.push({
    filter: 'format',
    options: 'rgba',
    inputs: current,
    outputs: fmtLbl,
  });

  // split -> [color, alpha-carrying stream]
  filters.push({
    filter: 'split',
    options: 2,
    inputs: fmtLbl,
    // fluent-ffmpeg accepts multiple outputs as an array
    outputs: [colLbl, aLbl] as unknown as string, // if your TS type only allows string, remove the cast and use distinct splits instead
  } as any);

  // extract alpha to a gray plane we will preserve untouched
  filters.push({
    filter: 'alphaextract',
    inputs: aLbl,
    outputs: apLbl,
  });

  // Work on the COLOR chain only
  let colorCurrent = colLbl;

  /* ── brightness / contrast / saturation (eq) ─────────────────────────── */
  const { brightness, contrast, saturate } = filter;

  if (
    brightness !== undefined ||
    contrast !== undefined ||
    saturate !== undefined
  ) {
    const mappedBrightness =
      brightness !== undefined
        ? calcRangeMap({
            value: brightness || 0,
            min: -1,
            max: 1,
            inputMin: -100,
            inputMax: 100,
          })
        : undefined;

    let mappedContrast: number | undefined;
    if (contrast !== undefined && contrast !== 0) {
      if (contrast < 0) {
        // less contrast: map -100..0 -> 0..1
        mappedContrast = calcRangeMap({
          value: contrast,
          min: 0,
          max: 1,
          inputMin: -100,
          inputMax: 0,
        });
      } else {
        // more contrast: map 0..100 -> 1..1000 (FFmpeg eq supports wide range)
        mappedContrast = calcRangeMap({
          value: contrast,
          min: 1,
          max: 1000,
          inputMin: 0,
          inputMax: 100,
        });
      }
    }

    let mappedSaturate: number | undefined;
    if (saturate !== undefined && saturate !== 0) {
      if (saturate < 0) {
        // desaturate: -100..0 -> 0..1
        mappedSaturate = calcRangeMap({
          value: saturate,
          min: 0,
          max: 1,
          inputMin: -100,
          inputMax: 0,
        });
      } else {
        // saturate: 0..100 -> 1..3
        mappedSaturate = calcRangeMap({
          value: saturate,
          min: 1,
          max: 3,
          inputMin: 0,
          inputMax: 100,
        });
      }
    }

    const parts: string[] = [];
    if (mappedBrightness !== undefined)
      parts.push(`brightness=${mappedBrightness}`);
    if (mappedContrast !== undefined) parts.push(`contrast=${mappedContrast}`);
    if (mappedSaturate !== undefined)
      parts.push(`saturation=${mappedSaturate}`);

    if (parts.length) {
      const out = `eq_${inputNumber}`;
      filters.push({
        filter: 'eq',
        options: parts.join(':'),
        inputs: colorCurrent,
        outputs: out,
      });
      colorCurrent = out;
    }
  }

  /* ── hue rotation ────────────────────────────────────────────────────── */
  if (filter['hue-rotate'] !== undefined && filter['hue-rotate'] !== 0) {
    const raw = String(filter['hue-rotate']).trim();
    const deg = raw.endsWith('deg') ? parseFloat(raw) : parseFloat(raw);
    const out = `hue_${inputNumber}`;
    // FFmpeg hue supports degrees via H=...
    filters.push({
      filter: 'hue',
      options: `H=${deg}`,
      inputs: colorCurrent,
      outputs: out,
    });
    colorCurrent = out;
  }

  /* ── blur (color only) ───────────────────────────────────────────────── */
  if (filter.blur !== undefined && Number(filter.blur) !== 0) {
    const shortest = Math.min(item.width as number, item.height as number) / 2;
    const radiusPct = Number(filter.blur);
    const mappedRadius = calcRangeMap({
      value: radiusPct,
      min: 0,
      max: shortest,
      inputMin: 0,
      inputMax: 100,
    });
    const out = `blur_${inputNumber}`;
    filters.push({
      filter: 'boxblur',
      options: mappedRadius,
      inputs: colorCurrent,
      outputs: out,
    });
    colorCurrent = out;
  }

  /* ── invert ──────────────────────────────────────────────────────────── */
  if (filter.invert) {
    const strength =
      typeof filter.invert === 'number' ? filter.invert : 1; /* full */
    const mappedStrength = calcRangeMap({
      value: strength,
      min: 0,
      max: 1,
      inputMin: 0,
      inputMax: 1,
    });

    const out = `invert_${inputNumber}`;
    if (mappedStrength >= 1) {
      filters.push({
        filter: 'negate',
        inputs: colorCurrent,
        outputs: out,
      });
    } else if (mappedStrength > 0) {
      filters.push({
        filter: 'lutrgb',
        options: `r='(1-${mappedStrength})*val+${mappedStrength}*(255-val)':g='(1-${mappedStrength})*val+${mappedStrength}*(255-val)':b='(1-${mappedStrength})*val+${mappedStrength}*(255-val)'`,
        inputs: colorCurrent,
        outputs: out,
      });
    } else {
      // no-op
      filters.push({
        filter: 'copy',
        inputs: colorCurrent,
        outputs: out,
      } as any);
    }
    colorCurrent = out;
  }

  /* ── color tint ──────────────────────────────────────────────────────── */
  if (filter.colorTint) {
    const hex = String(filter.colorTint);
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const out = `tint_${inputNumber}`;
    filters.push({
      filter: 'colorchannelmixer',
      options: `rr=${r}:gg=${g}:bb=${b}`,
      inputs: colorCurrent,
      outputs: out,
    });
    colorCurrent = out;
  }

  // --- Merge the untouched alpha back with the styled color ---
  const mergedLbl = `styled_${inputNumber}`;
  filters.push({
    filter: 'alphamerge',
    inputs: [colorCurrent, apLbl] as unknown as string,
    outputs: mergedLbl,
  } as any);

  return { filters, output: mergedLbl };
}
