export const CLOUD_REGIONS = ['singapore', 'tokyo', 'london', 'frankfurt', 'virginia'];
export const REGION_CONFIGS = {
  singapore: {
    id: 'singapore',
    displayName: 'Singapore',
    continent: 'Asia',
    dataResidency: 'regional',
    status: 'available',
    latencyZones: ['tokyo'],
    failoverRegions: ['tokyo'],
    capabilities: ['devices', 'browser', 'ai', 'mcp'],
  },
  tokyo: {
    id: 'tokyo',
    displayName: 'Tokyo',
    continent: 'Asia',
    countryCode: 'JP',
    dataResidency: 'in-country',
    status: 'available',
    latencyZones: ['singapore'],
    failoverRegions: ['singapore'],
    capabilities: ['devices', 'browser', 'ai'],
  },
  london: {
    id: 'london',
    displayName: 'London',
    continent: 'Europe',
    countryCode: 'GB',
    dataResidency: 'regional',
    status: 'available',
    latencyZones: ['frankfurt'],
    failoverRegions: ['frankfurt'],
    capabilities: ['devices', 'browser', 'ai', 'mcp'],
  },
  frankfurt: {
    id: 'frankfurt',
    displayName: 'Frankfurt',
    continent: 'Europe',
    countryCode: 'DE',
    dataResidency: 'in-country',
    status: 'available',
    latencyZones: ['london'],
    failoverRegions: ['london'],
    capabilities: ['devices', 'browser', 'ai', 'mcp'],
  },
  virginia: {
    id: 'virginia',
    displayName: 'Virginia',
    continent: 'Americas',
    countryCode: 'US',
    dataResidency: 'in-country',
    status: 'available',
    latencyZones: [],
    failoverRegions: ['london'],
    capabilities: ['devices', 'browser', 'ai', 'mcp'],
  },
};
export function isValidRegion(region) {
  return CLOUD_REGIONS.includes(region);
}
export function getRegionConfig(region) {
  return isValidRegion(region) ? REGION_CONFIGS[region] : undefined;
}
export function listRegions(status) {
  return CLOUD_REGIONS.filter(region => !status || REGION_CONFIGS[region].status === status);
}
export function getNearestRegion(region, latencyByRegion = {}) {
  const candidates = [region, ...REGION_CONFIGS[region].latencyZones];
  return candidates.reduce((best, candidate) => {
    const candidateLatency = latencyByRegion[candidate] ?? Number.POSITIVE_INFINITY;
    const bestLatency = latencyByRegion[best] ?? Number.POSITIVE_INFINITY;
    return candidateLatency < bestLatency ? candidate : best;
  });
}
export function getFailoverRegion(region) {
  return REGION_CONFIGS[region].failoverRegions.find(
    candidate => REGION_CONFIGS[candidate].status === 'available'
  );
}
export function selectRegion(options) {
  const requiredCapabilities = options.requiredCapabilities ?? [];
  const candidates = CLOUD_REGIONS.filter(region => {
    const config = REGION_CONFIGS[region];
    return (
      (!options.preferred ||
        region === options.preferred ||
        config.latencyZones.includes(options.preferred)) &&
      (!options.dataResidency || config.dataResidency === options.dataResidency) &&
      requiredCapabilities.every(capability => config.capabilities.includes(capability)) &&
      config.status !== 'offline'
    );
  });
  if (candidates.length === 0) throw new Error('No cloud region satisfies the request');
  if (
    options.preferred &&
    isValidRegion(options.preferred) &&
    candidates.includes(options.preferred)
  )
    return options.preferred;
  return candidates[0];
}
//# sourceMappingURL=cloud-regions.js.map
