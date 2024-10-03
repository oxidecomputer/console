import type * as Route from './+types.tmp-page'

export default function Component(args: Route.ComponentProps) {
  console.log(args.params.def)
  return <p>Some page contents</p>
}
