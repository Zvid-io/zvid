import getItemsGroups from '../../lib/videos/groupItems';
import { generateFiltersForGroup } from '../../lib/videos/generateFiltersForGroup';
import { ErrorHandler } from '../../errors';

export type FiltergraphBuild = {
  videoFilters: any[];
  finalVideoLabel: string;
};

export function buildVideoFiltergraph(items: any[]): FiltergraphBuild {
  const itemsGroups = getItemsGroups(items);

  if (itemsGroups.length > 0) {
    try {
      const videoFilters = generateFiltersForGroup(itemsGroups).flat();
      return {
        videoFilters,
        finalVideoLabel: `outv-${itemsGroups.length - 1}`,
      };
    } catch (error) {
      throw ErrorHandler.wrapError(error, 'generateFiltersForGroup');
    }
  }

  const finalVideoLabel = 'outv-0';
  return {
    finalVideoLabel,
    videoFilters: [
      {
        filter: 'null',
        inputs: '0:v',
        outputs: finalVideoLabel,
      },
    ],
  };
}
