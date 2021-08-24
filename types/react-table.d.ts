import type {
  UseRowSelectInstanceProps,
  UseRowSelectRowProps,
} from 'react-table'

declare module 'react-table' {
  export interface TableInstance<
    D extends Record<string, unknown> = Record<string, unknown>
  > extends UseRowSelectInstanceProps<D> {}

  export interface Row<
    D extends Record<string, unknown> = Record<string, unknown>
  > extends UseRowSelectRowProps<D> {}

  export interface HeaderGroup {
    className?: string
  }
}
