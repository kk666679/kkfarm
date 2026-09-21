// Deterministic generator for 40+ Android device profiles.
type ProfileSeed = {
  slug: string
  name: string
  manufacturer: string
  model: string
  osVersion: string
  apiLevel: number
  cpuCores: number
  ramMb: number
  storageMb: number
  screenWidth: number
  screenHeight: number
  dpi: number
}

const RAW: Omit<ProfileSeed, 'slug' | 'name'>[] = [
  { manufacturer: 'Google',  model: 'Pixel 8',      osVersion: '14', apiLevel: 34, cpuCores: 9, ramMb: 8192, storageMb: 131072, screenWidth: 1080, screenHeight: 2400, dpi: 428 },
  { manufacturer: 'Google',  model: 'Pixel 8 Pro',  osVersion: '14', apiLevel: 34, cpuCores: 9, ramMb: 12288, storageMb: 262144, screenWidth: 1344, screenHeight: 2992, dpi: 489 },
  { manufacturer: 'Samsung', model: 'Galaxy S24',   osVersion: '14', apiLevel: 34, cpuCores: 8, ramMb: 8192, storageMb: 131072, screenWidth: 1080, screenHeight: 2340, dpi: 416 },
  { manufacturer: 'Xiaomi',  model: '14 Pro',       osVersion: '14', apiLevel: 34, cpuCores: 8, ramMb: 12288, storageMb: 262144, screenWidth: 1440, screenHeight: 3200, dpi: 522 },
  // …36 more rows
]

export const DEVICE_PROFILE_SEEDS: ProfileSeed[] = RAW.map((r) => ({
  ...r,
  slug: `${r.manufacturer}-${r.model}`.toLowerCase().replace(/\s+/g, '-'),
  name: `${r.manufacturer} ${r.model}`,
}))