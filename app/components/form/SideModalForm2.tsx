import type { ReactNode } from 'react'
import { useState } from 'react'

import { SideModal } from '@oxide/ui'
import { flattenChildren, pluckFirstOfType } from '@oxide/util'

import type { FormProps } from './Form2'
import { Form } from './Form2'

interface SideModalFormProps<Values> extends Omit<FormProps<Values>, 'setSubmitState'> {
  isOpen: boolean
  onDismiss: () => void
  submitDisabled?: boolean
  error?: Error
  title: ReactNode
}

export function SideModalForm2<Values extends Record<string, unknown>>({
  id,
  children,
  onDismiss,
  isOpen,
  submitDisabled = false,
  error,
  title,
  ...formProps
}: SideModalFormProps<Values>) {
  const [submitState, setSubmitState] = useState(true)
  const childArray = flattenChildren(children)
  const submit = pluckFirstOfType(childArray, Form.Submit)

  return (
    <SideModal id={`${id}-modal`} onDismiss={onDismiss} isOpen={isOpen}>
      {title && <SideModal.Title id={`${id}-title`}>{title}</SideModal.Title>}
      <SideModal.Body>
        <Form
          id={id}
          className="is-side-modal"
          setSubmitState={setSubmitState}
          {...formProps}
        >
          {childArray}
        </Form>
      </SideModal.Body>
      <SideModal.Footer>
        <Form.Actions
          formId={id}
          submitDisabled={submitDisabled || !submitState}
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
