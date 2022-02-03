export function assertUnreachable(_: never): never {
  throw new Error('This code path should be unreachable')
}
