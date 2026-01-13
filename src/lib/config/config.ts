import { configType } from '../../types/config.type';

class Config {
  private config: configType;

  constructor() {
    this.config = {
      width: 1280,
      height: 720,
    };
  }

  getConfig() {
    return this.config;
  }

  updateConfig(newConfig: Partial<configType>) {
    if (newConfig.width !== undefined) {
      this.config.width = newConfig.width;
    }
    if (newConfig.height !== undefined) {
      this.config.height = newConfig.height;
    }
  }
}

const configInstance = new Config();
export default configInstance;
