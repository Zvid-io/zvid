import fs from 'fs';
import os from 'os';
import path from 'path';
import { FfmpegCommand } from 'fluent-ffmpeg';
import complexFiltersToFiltergraph from '../complexFiltersToFiltergraph';
import { safeUnlinkSync } from '../fs';

export class FilterComplexScript {
  private filePath: string | null = null;

  constructor(private readonly prefix = 'ffmpeg-filtergraph') {}

  attach(command: FfmpegCommand, filters: any[]): void {
    if (!filters?.length) return;

    const filtergraph = complexFiltersToFiltergraph(filters);
    this.filePath = this.makeTempPath();
    fs.writeFileSync(this.filePath, filtergraph, 'utf8');

    command.addOption(`-filter_complex_script ${this.filePath}`);
  }

  cleanup(): void {
    if (!this.filePath) return;
    safeUnlinkSync(this.filePath);
    this.filePath = null;
  }

  private makeTempPath(): string {
    const name = `${this.prefix}-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2)}.txt`;
    return path.join(os.tmpdir(), name);
  }
}
