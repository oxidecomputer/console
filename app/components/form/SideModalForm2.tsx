import type { ReactNode } from 'react'
import type { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form'

import { SideModal } from '@oxide/ui'
import { flattenChildren, pluckFirstOfType } from '@oxide/util'

import { Form } from './Form2'

type SideModalFormProps<TFieldValues extends FieldValues> = {
  id: string
  className?: string
  children: ReactNode
  isOpen: boolean
  onDismiss: () => void
  submitDisabled?: boolean
  error?: Error
  title: ReactNode
  onSubmit: SubmitHandler<TFieldValues>
  form: UseFormReturn<TFieldValues>
}

export function SideModalForm2<TFieldValues extends FieldValues>({
  id,
  children,
  onDismiss,
  isOpen,
  submitDisabled = false,
  error,
  title,
  onSubmit,
  form,
  ...formProps
}: SideModalFormProps<TFieldValues>) {
  const {
    handleSubmit,
    formState: { isDirty, isValid },
  } = form
  const canSubmit = isDirty && isValid
  const childArray = flattenChildren(children)
  const submit = pluckFirstOfType(childArray, Form.Submit)

  return (
    <SideModal id={`${id}-modal`} onDismiss={onDismiss} isOpen={isOpen}>
      {title && <SideModal.Title id={`${id}-title`}>{title}</SideModal.Title>}
      <SideModal.Body>
        <form
          id={id}
          className="ox-form is-side-modal"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          {...formProps}
        >
          {children}
        </form>
      </SideModal.Body>
      <SideModal.Footer>
        <Form.Actions
          formId={id}
          submitDisabled={submitDisabled || !canSubmit}
          error={error}
          className="flex-row-reverse"
        >
          {submit || <Form.Submit>{title}</Form.Submit>}
          <Form.Cancel onClick={onDismiss} />
        </Form.Actions>
      </SideModal.Footer>
    </SideModal>
  )
}
