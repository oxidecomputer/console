export function assertUnreachable(message: string, ..._: never[]): never {
  throw new Error(message)
}
