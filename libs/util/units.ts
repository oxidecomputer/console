export const KiB = 1_024
export const MiB = 1_048_576
export const GiB = 1_073_741_824
export const TiB = 1_099_511_627_776

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest

  it('should match units to their mathematical equivalents', () => {
    expect(KiB).toBe(Math.pow(2, 10))
    expect(MiB).toBe(Math.pow(2, 20))
    expect(GiB).toBe(Math.pow(2, 30))
    expect(TiB).toBe(Math.pow(2, 40))
  })
}
