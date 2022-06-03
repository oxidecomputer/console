import { classed, flattenChildren, pluckFirstOfType, tunnel } from '@oxide/util'
import type { FormProps } from './Form'
import { Form } from './Form'
import type { ReactNode } from 'react'
import { cloneElement } from 'react'

const PageActionsTunnel = tunnel('form-page-actions')

interface FullPageModalProps<Values> extends FormProps<Values> {
  title: ReactNode
  submitDisabled?: boolean
  error?: Error
}

const PageActionsContainer = classed.div`flex h-20 items-center`

export function FullPageModal<Values>({
  title,
  children,
  submitDisabled,
  error,
  ...formProps
}: FullPageModalProps<Values>) {
  const childArray = flattenChildren(children)
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      {title}
      <Form className="pb-20" {...formProps}>
        {childArray}
      </Form>
      {actions && (
        <PageActionsTunnel.In>
          <PageActionsContainer>
            {cloneElement(actions, {
              formId: formProps.id,
              submitDisabled,
              error,
            })}
          </PageActionsContainer>
        </PageActionsTunnel.In>
      )}
    </>
  )
}

export const PageFormActions = PageActionsTunnel.Out
