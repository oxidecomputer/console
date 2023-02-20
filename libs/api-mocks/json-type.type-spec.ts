import { assertType } from 'vitest'

import type { VpcSubnet } from '@oxide/api'

import type { Json } from './json-type'

// Tests of a sort. These assertType calls will fail to typecheck if the types
// are not equal. There's no point in wrapping this in a real test because it
// will always pass.

let val: any // eslint-disable-line @typescript-eslint/no-explicit-any

// just checking :)
assertType<1>(val as 1)
// @ts-expect-error
assertType<1>(val as 2)
// @ts-expect-error
assertType<{ x: string }>(val as { x: number })

assertType<string>(val as Json<Date>)
assertType<number>(val as Json<number>)
assertType<{ x: string; y: number }>(val as Json<{ x: Date; y: number }>)
assertType<{ x: { a_b45_c: string }; z: string[] }>(
  val as Json<{ x: { aB45C: Date }; z: Date[] }>
)

type VpcSubnetJSON = {
  description: string
  id: string
  ipv4_block?: string | null
  ipv6_block?: string | null
  name: string
  time_created: string
  time_modified: string
  vpc_id: string
}

assertType<VpcSubnetJSON>(val as Json<VpcSubnet>)
