import React from 'react'
import type { AsyncReturnType } from 'type-fest'

import type { ApiViewByIdMethods } from '@oxide/api'
import { useApiQuery } from '@oxide/api'

import type { Cell } from './Cell'

interface IdLookupCellProps<M extends keyof ApiViewByIdMethods> {
  type: M
  field: keyof NonNullable<AsyncReturnType<ApiViewByIdMethods[M]>['data']>
  value: string
}
function IdLookupCell<M extends keyof ApiViewByIdMethods>({
  type,
  field,
  value,
}: IdLookupCellProps<M>) {
  const { data } = useApiQuery<M>(type, { id: value })
  return (data && <span className="text-default">{data[field]}</span>) || null
}

export const byIdCell =
  <M extends keyof ApiViewByIdMethods>(
    type: IdLookupCellProps<M>['type'],
    field: IdLookupCellProps<M>['field']
  ) =>
  ({ value }: Cell<string>) => {
    return <IdLookupCell type={type} field={field} value={value} />
  }
