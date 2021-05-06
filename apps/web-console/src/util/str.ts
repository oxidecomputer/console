export const capitalize = (s: string | null | undefined) =>
  s && s.charAt(0).toUpperCase() + s.slice(1)

const errorRegex = /^unable to parse body: (.+) at line \d+ column \d+$/

export const getServerParseError = (message: string | undefined) => {
  const innerMsg = message && errorRegex.exec(message)?.[1]
  return capitalize(innerMsg) || 'Unknown error from server'
}
