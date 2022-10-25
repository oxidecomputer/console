import type { SetRequired } from 'type-fest'

import type { ErrorResult } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'

export type CreateFormProps<TFieldValues, Data> = {
  id?: string
  defaultValues?: TFieldValues
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResult) => void
  onDismiss?: () => void
}

export type CreateSideModalFormProps<Values, Data> = CreateFormProps<Values, Data> &
  Omit<SideModalProps, 'id'>

export type EditSideModalFormProps<Values, Data> = SetRequired<
  CreateFormProps<Values, Data>,
  'defaultValues'
> &
  CreateSideModalFormProps<Values, Data>

export * from './fields/DescriptionField'
export * from './fields/NameField'
export * from './fields/TextField'

export * from './SideModalForm'
