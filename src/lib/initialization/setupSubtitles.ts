import { buildAssFile } from '../subtitles/content/buildAssFile';

export default async function setupSubtitles(subtitle: any) {
  // Shallow clone to avoid mutating the original
  const subtitleCopy = { ...subtitle };

  if (Array.isArray(subtitleCopy.captions)) {
    // Sort captions by start time
    subtitleCopy.captions = [...subtitleCopy.captions].sort(
      (a, b) => (a.start || 0) - (b.start || 0)
    );
  }

  await buildAssFile(subtitleCopy);
}
