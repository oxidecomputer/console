import type { ErrorResponse } from '@oxide/api'
import type { ButtonProps } from '@oxide/ui'
import { Divider } from '@oxide/ui'
import {
  classed,
  flattenChildren,
  getServerError,
  kebabCase,
  pluckFirstOfType,
} from '@oxide/util'
import type { FormikConfig } from 'formik'
import { Formik, Form as FormikForm } from 'formik'
import type { ReactNode } from 'react'
import React from 'react'
import type { UseMutationResult } from 'react-query'
import './form.css'

interface FormProps<Values> extends FormikConfig<Values> {
  id: string
  children: ReactNode
}

export function Form<Values>({
  id,
  children,
  ...formikProps
}: FormProps<Values>) {
  const childArray = flattenChildren(children)
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      <Formik {...formikProps}>
        <FormikForm id={id} className="ox-form space-y-9">
          {childArray}
        </FormikForm>
      </Formik>
      {actions && React.cloneElement(actions, { formId: id })}
    </>
  )
}

interface FormActionsProps<D, E extends ErrorResponse | null, T> {
  mutation: UseMutationResult<D, E, T>
  errorCodes: Record<string, string>
  formId?: string
  children: React.ReactNode
}
Form.Actions = <D, E extends ErrorResponse | null, T>({
  children,
  mutation,
  formId,
  errorCodes,
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
            disabled: mutation.isLoading,
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
    <>
      <div className="flex-1" />
      <Separator className="mb-6 mt-16" />
      {mutation.error && (
        <div className="mt-2 text-destructive">
          {getServerError(mutation.error, errorCodes)}
        </div>
      )}
      <div className="flex space-x-2">{childArray}</div>
    </>
  )
}

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
