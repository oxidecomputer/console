export const incrementName = (str: string) => {
  let name = str
  const match = name.match(/(.*)-(\d+)$/)

  if (match) {
    const base = match[1]
    const num = parseInt(match[2], 10)
    name = `${base}-${num + 1}`
  } else {
    name = `${name}-1`
  }

  return name
}
