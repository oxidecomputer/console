import { useMemo } from 'react'

const rand = () => Math.random().toString(16).substring(2, 10)

export const useUuid = (prefix = '', suffix = '') =>
  useMemo(() => [prefix, rand(), suffix].filter(Boolean).join('-'), [prefix, suffix])
