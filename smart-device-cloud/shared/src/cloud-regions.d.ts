export declare const CLOUD_REGIONS: readonly [
  'singapore',
  'tokyo',
  'london',
  'frankfurt',
  'virginia',
];
export type CloudRegion = (typeof CLOUD_REGIONS)[number];
export type RegionStatus = 'available' | 'degraded' | 'maintenance' | 'offline';
export type DataResidency = 'global' | 'regional' | 'in-country';
export interface RegionConfig {
  id: CloudRegion;
  displayName: string;
  continent: 'Asia' | 'Europe' | 'Americas';
  countryCode?: string;
  dataResidency: DataResidency;
  status: RegionStatus;
  latencyZones: CloudRegion[];
  failoverRegions: CloudRegion[];
  capabilities: string[];
}
export declare const REGION_CONFIGS: Record<CloudRegion, RegionConfig>;
export declare function isValidRegion(region: string): region is CloudRegion;
export declare function getRegionConfig(region: CloudRegion | string): RegionConfig | undefined;
export declare function listRegions(status?: RegionStatus): CloudRegion[];
export declare function getNearestRegion(
  region: CloudRegion,
  latencyByRegion?: Readonly<Partial<Record<CloudRegion, number>>>
): CloudRegion;
export declare function getFailoverRegion(region: CloudRegion): CloudRegion | undefined;
export declare function selectRegion(options: {
  preferred?: CloudRegion | string;
  requiredCapabilities?: readonly string[];
  dataResidency?: DataResidency;
}): CloudRegion;
//# sourceMappingURL=cloud-regions.d.ts.map
