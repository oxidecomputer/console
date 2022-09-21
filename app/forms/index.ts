import type { SetRequired } from 'type-fest'

import type { ErrorResult } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'

import type { FormProps } from 'app/components/form'

export type CreateFormProps<Values, Data> = Partial<
  Pick<FormProps<Values>, 'id' | 'initialValues' | 'onSubmit'>
> & {
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResult) => void
}

export type CreateSideModalFormProps<Values, Data> = CreateFormProps<Values, Data> &
  Omit<SideModalProps, 'id'>

export type EditSideModalFormProps<Values, Data> = SetRequired<
  CreateFormProps<Values, Data>,
  'initialValues'
> &
  CreateSideModalFormProps<Values, Data>
