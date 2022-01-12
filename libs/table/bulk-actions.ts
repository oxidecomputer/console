import type { ApiListMethods, ResultItem } from '@oxide/api'

export type BulkAction<A extends ApiListMethods, M extends keyof A> = {
  label: string
  icon: JSX.Element
  onActivate: (items: ResultItem<A[M]>[]) => void
}
