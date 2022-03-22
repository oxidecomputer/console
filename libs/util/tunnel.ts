import t from 'tunnel-rat'

export const tunnel = (key: string) => {
  if (import.meta.hot) {
    const fullKey = `tunnel-${key}`
    if (import.meta.hot.data[fullKey]) {
      return import.meta.hot.data[fullKey]
    }
    import.meta.hot.data[fullKey] = t()
    return import.meta.hot.data[fullKey]
  }
  return t()
}
