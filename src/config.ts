interface Config {
  isBackend: boolean;
}

let config: Config = {
  isBackend: false,
};

export function setConfig(newConfig: Config) {
  config = {...config, ...newConfig};
}

export function getConfig() {
  return config;
}
