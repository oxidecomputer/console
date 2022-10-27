import type { ErrorResult } from '@oxide/api'

export type SideModalFormProps<TFieldValues, Data> = {
  title?: string
  defaultValues?: TFieldValues
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResult) => void
  onDismiss?: () => void
}

export * from './fields/DescriptionField'
export * from './fields/NameField'
export * from './fields/TextField'

export * from './SideModalForm'
