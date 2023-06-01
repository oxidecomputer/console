export const KiB = 1024
export const MiB = 1024 * KiB
export const GiB = 1024 * MiB
export const TiB = 1024 * GiB

export const bytesToGiB = (b: number) => round(b / GiB, 2)
export const bytesToTiB = (b: number) => round(b / TiB, 2)

function round(num: number, digits: number) {
  const pow10 = Math.pow(10, digits)
  return Math.round((num + Number.EPSILON) * pow10) / pow10
}
