import type { ButtonProps } from '@oxide/ui'
import { Button } from '@oxide/ui'
import { SideModal } from '@oxide/ui'
import { useIsInSideModal } from '@oxide/ui'
import { Divider } from '@oxide/ui'
import {
  addProps,
  classed,
  flattenChildren,
  invariant,
  isOneOf,
  kebabCase,
  pluckFirstOfType,
  tunnel,
  Wrap,
} from '@oxide/util'
import type { FormikConfig } from 'formik'
import { Formik } from 'formik'
import { cloneElement } from 'react'
import type { ReactNode } from 'react'
import React from 'react'
import './form.css'
import cn from 'classnames'
import type { ErrorResponse } from '@oxide/api'

const PageActionsTunnel = tunnel('form-page-actions')
const SideModalActionsTunnel = tunnel('form-sidebar-actions')

const PageActionsContainer = classed.div`flex h-20 items-center`

type Mutation =
  | {
      status: 'idle' | 'loading'
      data: undefined
      error: null
    }
  | {
      status: 'success'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: any
      error: null
    }
  | {
      status: 'error'
      data: undefined
      error: ErrorResponse
    }

export interface FormProps<Values> extends FormikConfig<Values> {
  id: string
  title?: ReactNode
  children: ReactNode
  onDismiss?: () => void
  mutation: Mutation
}

export function Form<Values>({
  id,
  title,
  children,
  mutation,
  onDismiss,
  ...formikProps
}: FormProps<Values>) {
  const isSideModal = useIsInSideModal()
  const childArray = flattenChildren(children)
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      {title && isSideModal && (
        <SideModal.Title id={`${id}-title`}>{title}</SideModal.Title>
      )}
      <Wrap if={isSideModal} wrapper={<SideModal.Body />}>
        <Formik {...formikProps}>
          {(props) => (
            <>
              <form
                id={id}
                className={cn('ox-form space-y-7', {
                  'pb-20': !isSideModal,
                  'is-side-modal': isSideModal,
                })}
                onReset={props.handleReset}
                onSubmit={props.handleSubmit}
              >
                <>{childArray}</>
              </form>
              {actions &&
                (isSideModal ? (
                  <SideModalActionsTunnel.In>
                    {cloneElement(actions, {
                      formId: id,
                      submitDisabled:
                        !props.dirty ||
                        !props.isValid ||
                        mutation.status === 'loading',
                      onDismiss,
                    })}
                  </SideModalActionsTunnel.In>
                ) : (
                  <PageActionsTunnel.In>
                    <PageActionsContainer>
                      {cloneElement(actions, {
                        formId: id,
                        submitDisabled:
                          !props.dirty ||
                          !props.isValid ||
                          mutation.status === 'loading',
                      })}
                    </PageActionsContainer>
                  </PageActionsTunnel.In>
                ))}
            </>
          )}
        </Formik>
      </Wrap>
      {actions && isSideModal && (
        <SideModal.Footer>
          <SideModalActionsTunnel.Out />
        </SideModal.Footer>
      )}
    </>
  )
}

interface FormActionsProps {
  formId?: string
  children: React.ReactNode
  submitDisabled?: boolean
  onDismiss?: () => void
}

/**
 * This component is the area at the bottom of a form that contains
 * the submit button and any other actions. The first button is automatically
 * given a type of "submit." Default styles are applied all buttons but can be
 * overridden.
 */
Form.Actions = ({
  children,
  formId,
  submitDisabled = true,
  onDismiss,
}: FormActionsProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isSideModal = useIsInSideModal()
  const childArray = flattenChildren(children).map(
    addProps<typeof Button>((i, props) => ({
      size: 'sm',
      color: 'accent',
      ...props,
    }))
  )

  invariant(
    isOneOf(childArray, [Form.Submit, Form.Cancel, Button]),
    'Form.Actions should only receive Button components as children'
  )

  const submit = pluckFirstOfType(childArray, Form.Submit)
  const cancel = pluckFirstOfType(childArray, Form.Cancel)

  invariant(submit, 'Form.Actions must contain a Form.Submit component')

  return (
    <div
      className={cn('flex gap-[0.625rem]', { 'flex-row-reverse': isSideModal })}
    >
      {cloneElement(submit, { form: formId, disabled: submitDisabled })}
      {isSideModal && cancel && cloneElement(cancel, { onClick: onDismiss })}
      {childArray}
    </div>
  )
}

Form.Submit = (props: ButtonProps) => (
  <Button type="submit" variant="default" {...props} />
)

Form.Cancel = (props: ButtonProps) => (
  <Button variant="secondary" {...props}>
    Cancel
  </Button>
)

Form.PageActions = PageActionsTunnel.Out

const FormHeading = classed.h2`ox-form-heading text-content text-sans-2xl`
export interface FormSectionProps {
  id?: string
  children: React.ReactNode
  title: string
}
Form.Section = ({ id, title, children }: FormSectionProps) => {
  return (
    <>
      <Divider />
      <FormHeading id={id || kebabCase(title)}>{title}</FormHeading>
      {children}
    </>
  )
}
