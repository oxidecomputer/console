import type { VpcSubnet } from '@oxide/api'
import type { Json } from './json-type'

// Tests of a sort. These expectType calls will fail to typecheck if the types
// are not equal. There's no point in wrapping this in a real test because it
// will always pass.

const expectType = <T>(_value: T) => {}

let val: any // eslint-disable-line @typescript-eslint/no-explicit-any

// just checking :)
expectType<1>(val as 1)
// @ts-expect-error
expectType<1>(val as 2)
// @ts-expect-error
expectType<{ x: string }>(val as { x: number })

expectType<string>(val as Json<Date>)
expectType<number>(val as Json<number>)
expectType<{ x: string; y: number }>(val as Json<{ x: Date; y: number }>)
expectType<{ x: { a_b45_c: string }; z: string[] }>(
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

expectType<VpcSubnetJSON>(val as Json<VpcSubnet>)
