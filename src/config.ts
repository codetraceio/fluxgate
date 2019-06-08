interface IConfig {
  isBackend: boolean;
}

let config: IConfig = {
  isBackend: false,
};

export function setConfig(newConfig: IConfig) {
  config = {...config, ...newConfig};
}

export function getConfig() {
  return config;
}
