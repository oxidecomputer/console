import type { FormEventHandler, ReactNode } from 'react'

import { SideModal } from '@oxide/ui'
import { flattenChildren, pluckFirstOfType } from '@oxide/util'

// note we're using the things that hang off of Form but not Form itself
import { Form } from 'app/components/form'

type SideModalFormProps = {
  id: string
  children: ReactNode
  isOpen: boolean
  onDismiss: () => void
  submitDisabled?: boolean
  error?: Error
  title: ReactNode
  onSubmit: FormEventHandler<HTMLFormElement>
}

export function SideModalForm({
  id,
  children,
  onDismiss,
  isOpen,
  submitDisabled = false,
  error,
  title,
  onSubmit,
}: SideModalFormProps) {
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
          onSubmit={onSubmit}
        >
          {childArray}
        </form>
      </SideModal.Body>
      <SideModal.Footer>
        <Form.Actions
          formId={id}
          submitDisabled={submitDisabled}
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
