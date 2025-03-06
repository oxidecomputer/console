export class Rando {
  private a: number
  private c: number
  private m: number
  private seed: number

  constructor(seed: number, a = 1664525, c = 1013904223, m = 2 ** 32) {
    this.seed = seed
    this.a = a
    this.c = c
    this.m = m
  }

  public next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m
    return this.seed / this.m
  }
}
