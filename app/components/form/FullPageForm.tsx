import { classed, flattenChildren, pluckFirstOfType, tunnel } from '@oxide/util'
import type { FormProps } from './Form'
import { Form } from './Form'
import type { ReactElement } from 'react'
import { useState } from 'react'
import { cloneElement } from 'react'
import { PageHeader, PageTitle } from '@oxide/ui'

const PageActionsTunnel = tunnel('form-page-actions')

export interface FullPageFormProps<Values>
  extends Omit<FormProps<Values>, 'setSubmitState'> {
  title: string
  icon: ReactElement
  submitDisabled?: boolean
  error?: Error
}

const PageActionsContainer = classed.div`flex h-20 items-center`

export function FullPageForm<Values>({
  title,
  children,
  submitDisabled = false,
  error,
  icon,
  ...formProps
}: FullPageFormProps<Values>) {
  const [submitState, setSubmitState] = useState(true)
  const childArray = flattenChildren(children)
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={icon}>{title}</PageTitle>
      </PageHeader>
      <Form setSubmitState={setSubmitState} className="pb-20" {...formProps}>
        {childArray}
      </Form>
      {actions && (
        <PageActionsTunnel.In>
          <PageActionsContainer>
            {cloneElement(actions, {
              formId: formProps.id,
              submitDisabled: submitDisabled || !submitState,
              error,
            })}
          </PageActionsContainer>
        </PageActionsTunnel.In>
      )}
    </>
  )
}

export const PageFormActions = PageActionsTunnel.Out
