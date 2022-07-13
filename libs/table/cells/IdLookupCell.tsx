import React from 'react'

import type { ApiMethods, ApiViewByIdMethods } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

import type { Cell } from './Cell'

interface IdLookupCellProps<M extends keyof ApiViewByIdMethods> {
  type: M
  field: keyof Parameters<ApiViewByIdMethods[M]>[0]
  value: string
}
function IdLookupCell<M extends keyof ApiViewByIdMethods>({
  type,
  field,
  value,
}: IdLookupCellProps<M>) {
  const { data } = useApiQuery(type, { id: value })
  return (data && <span className="text-default">{data[field]}</span>) || null
}

type ByIdMethod<M> = M extends keyof ApiMethods
  ? M extends `${string}ViewById`
    ? M
    : never
  : never

export const byIdCell =
  <M,>(type: ByIdMethod<M>, field: keyof ApiMethods[ByIdMethod<M>]) =>
  ({ value }: Cell<string>) => {
    return <IdLookupCell type={type} field={field} value={value} />
  }
