export function buildOutputOptions(params: {
  usesComplexFilter: boolean;
  mappedVideoLabel: string;
  duration: number;
  audioFilters: any[];
  thumbnailInputIndex: number | null;
}): string[] {
  const {
    usesComplexFilter,
    mappedVideoLabel,
    duration,
    audioFilters,
    thumbnailInputIndex,
  } = params;

  const outputOptions: string[] = [
    `-map ${usesComplexFilter ? `[${mappedVideoLabel}]` : `0:v`}`,
    `-t ${duration}`,
  ];

  if (usesComplexFilter && audioFilters.length) {
    outputOptions.push('-map [outa]');
  }

  if (thumbnailInputIndex !== null) {
    outputOptions.push(`-map ${thumbnailInputIndex}:v`);
    outputOptions.push(`-c:v:1 copy`);
    outputOptions.push(`-disposition:v:1 attached_pic`);
  }

  return outputOptions;
}
