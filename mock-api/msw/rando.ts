/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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
