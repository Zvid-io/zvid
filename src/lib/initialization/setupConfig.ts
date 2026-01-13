import { Project } from '../../types/items.type';
import config from '../config/config';
import { resolveProjectDimensions } from '../../utils/resolutionResolver';

export default async function setupVideoConfig(project: Project) {
  const { width, height } = resolveProjectDimensions(project);

  config.updateConfig({
    width,
    height,
  });
}
