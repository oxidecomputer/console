import type { ErrorResponse } from '@oxide/api'
import type { ButtonProps } from '@oxide/ui'
import { SideModal } from '@oxide/ui'
import { useIsInSideModal } from '@oxide/ui'
import { Divider } from '@oxide/ui'
import {
  classed,
  flattenChildren,
  getServerError,
  kebabCase,
  pluckFirstOfType,
  tunnel,
} from '@oxide/util'
import type { FormikConfig } from 'formik'
import { Formik } from 'formik'
import type { ReactElement, ReactNode } from 'react'
import React from 'react'
import type { UseMutationResult } from 'react-query'
import './form.css'
import cn from 'classnames'

const FormActionsTunnel = tunnel('form-actions')

interface FormProps<Values> extends FormikConfig<Values> {
  id: string
  children: ReactNode
}

export function Form<Values>({
  id,
  children,
  ...formikProps
}: FormProps<Values>) {
  const isSideModal = useIsInSideModal()
  const childArray = flattenChildren(children)
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      <Formik {...formikProps}>
        {(props) => (
          <>
            <form
              id={id}
              className={cn('ox-form space-y-9', { 'pb-20': !isSideModal })}
              onReset={props.handleReset}
              onSubmit={props.handleSubmit}
            >
              <>{childArray}</>
            </form>
            {actions && !isSideModal && (
              <FormActionsTunnel.In>
                {React.cloneElement(actions, {
                  formId: id,
                  submitDisabled: !props.dirty || !props.isValid,
                })}
              </FormActionsTunnel.In>
            )}
          </>
        )}
      </Formik>
      {actions && isSideModal && (
        <SideModal.Footer>
          <FormActionsTunnel.Out />
        </SideModal.Footer>
      )}
    </>
  )
}

interface FormActionsProps<D, E extends ErrorResponse | null, T> {
  mutation: UseMutationResult<D, E, T>
  errorCodes: Record<string, string>
  formId?: string
  children: React.ReactNode
  submitDisabled?: boolean
}
Form.Actions = <D, E extends ErrorResponse | null, T>({
  children,
  mutation,
  formId,
  errorCodes,
  submitDisabled = true,
}: FormActionsProps<D, E, T>) => {
  const childArray = flattenChildren(children).map((child, index) => {
    const buttonStyle: Pick<
      ButtonProps,
      'variant' | 'color' | 'disabled' | 'type'
    > =
      index === 0
        ? {
            variant: 'default',
            color: 'accent',
            disabled: submitDisabled || mutation.isLoading,
            type: 'submit',
          }
        : index === 1
        ? { variant: 'secondary', color: 'accent' }
        : { variant: 'ghost', color: 'accent' }
    return React.cloneElement(child as React.ReactElement, {
      form: formId,
      size: 'sm',
      ...buttonStyle,
      ...(child as React.ReactElement).props,
    })
  })
  return (
    <div className="flex h-20 items-center">
      {mutation.error && (
        <div className="mt-2 text-destructive">
          {getServerError(mutation.error, errorCodes)}
        </div>
      )}
      <div className="flex space-x-2">{childArray}</div>
    </div>
  )
}

Form.ActionsTarget = FormActionsTunnel.Out as () => ReactElement | null

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
