import type { ReactNode } from 'react'
import type { FieldValues, SubmitHandler, UseFormReturn } from 'react-hook-form'

import { SideModal } from '@oxide/ui'
import { flattenChildren, pluckFirstOfType } from '@oxide/util'

// note we're using the things that hang off of Form but not Form itself
import { Form } from 'app/components/form'

type SideModalFormProps<TFieldValues extends FieldValues> = {
  id: string
  children: ReactNode
  isOpen: boolean
  onDismiss: () => void
  submitDisabled?: boolean
  error?: Error
  title: ReactNode
  onSubmit: SubmitHandler<TFieldValues>
  form: UseFormReturn<TFieldValues>
}

export function SideModalForm<TFieldValues extends FieldValues>({
  id,
  children,
  onDismiss,
  isOpen,
  submitDisabled = false,
  error,
  title,
  onSubmit,
  form,
}: SideModalFormProps<TFieldValues>) {
  // TODO: I don't really like passing the form instance and doing this stuff
  // here. it splits the logic between the useForm call site and here for no
  // clear reason
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
