export const KiB = 1024
export const MiB = 1024 * KiB
export const GiB = 1024 * MiB
export const TiB = 1024 * GiB

export const bytesToGiB = (b: number) => b / GiB
export const bytesToTiB = (b: number) => b / TiB
