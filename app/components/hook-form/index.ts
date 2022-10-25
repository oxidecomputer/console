import type { SetRequired } from 'type-fest'

import type { ErrorResult } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'

export type CreateSideModalFormProps<TFieldValues, Data> = Omit<SideModalProps, 'id'> & {
  defaultValues?: TFieldValues
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResult) => void
  onDismiss?: () => void
}

/** Same as `CreateSideModalFormProps` except with `defaultValues` required */
export type EditSideModalFormProps<TFieldValues, Data> = SetRequired<
  CreateSideModalFormProps<TFieldValues, Data>,
  'defaultValues'
>

export * from './fields/DescriptionField'
export * from './fields/NameField'
export * from './fields/TextField'

export * from './SideModalForm'
