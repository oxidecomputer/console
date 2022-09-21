import type { ReactElement } from 'react'
import { useState } from 'react'
import { cloneElement } from 'react'

import { PageHeader, PageTitle } from '@oxide/ui'
import { classed, flattenChildren, pluckFirstOfType } from '@oxide/util'

import { PageActions } from '../PageActions'
import type { FormProps } from './Form'
import { Form } from './Form'

interface FullPageFormProps<Values> extends Omit<FormProps<Values>, 'setSubmitState'> {
  id: string
  title: string
  icon: ReactElement
  submitDisabled?: boolean
  error?: Error
}

const PageActionsContainer = classed.div`flex h-20 items-center gutter`

export function FullPageForm<Values extends Record<string, unknown>>({
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
        <PageActions>
          <PageActionsContainer>
            {cloneElement(actions, {
              formId: formProps.id,
              submitDisabled: submitDisabled || !submitState,
              error,
            })}
          </PageActionsContainer>
        </PageActions>
      )}
    </>
  )
}
