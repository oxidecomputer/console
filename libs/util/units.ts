export const KiB = 1024
export const MiB = 1024 * KiB
export const GiB = 1024 * MiB

export const bytesToGiB = (b: number) => Math.floor(b / GiB)
