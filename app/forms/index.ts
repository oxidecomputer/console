import type { SetRequired } from 'type-fest'

import type { ErrorResult } from '@oxide/api'
import type { SideModalProps } from '@oxide/ui'

import type { FormProps, FullPageFormProps } from 'app/components/form'

type CreateFormProps<Values, Data> = Omit<
  Optional<FormProps<Values>, 'id' | 'initialValues' | 'onSubmit'>,
  'children'
> & {
  onSuccess?: (data: Data) => void
  onError?: (err: ErrorResult) => void
}

export type CreateSideModalFormProps<Values, Data> = CreateFormProps<Values, Data> &
  Omit<SideModalProps, 'id'>

export type CreateFullPageFormProps<Values, Data> = CreateFormProps<Values, Data> &
  Omit<FullPageFormProps<Values>, 'icon'>

export type EditSideModalFormProps<Values, Data> = SetRequired<
  CreateFormProps<Values, Data>,
  'initialValues'
> &
  CreateSideModalFormProps<Values, Data>

export type EditFullPageFormProps<Values, Data> = SetRequired<
  CreateFormProps<Values, Data>,
  'initialValues'
> &
  CreateFullPageFormProps<Values, Data>
