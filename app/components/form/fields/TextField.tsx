/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useId } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type Validate,
} from 'react-hook-form'

import { capitalize } from '@oxide/util'

import { FieldLabel } from '~/ui/lib/FieldLabel'
import {
  TextInputHint,
  TextInput as UITextField,
  type TextAreaProps as UITextAreaProps,
  type TextInputBaseProps as UITextFieldProps,
} from '~/ui/lib/TextInput'

import { ErrorMessage } from './ErrorMessage'

export interface TextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends UITextFieldProps {
  name: TName
  /** HTML type attribute, defaults to text */
  type?: 'text' | 'password'
  /** Will default to name if not provided */
  label?: string
  /**
   * Displayed inline as supplementary text to the label. Should
   * only be used for text that's necessary context for helping
   * complete the input. This will be announced in tandem with the
   * label when using a screen reader.
   */
  description?: string | React.ReactNode
  /**
   * Displayed in a tooltip beside the title. This field should be used
   * for auxiliary context that helps users understand extra context about
   * a field but isn't specifically required to know how to complete the input.
   * This is announced as an `aria-description`
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-description
   */
  tooltipText?: string
  placeholder?: string
  units?: string
  validate?: Validate<FieldPathValue<TFieldValues, TName>, TFieldValues>
  control: Control<TFieldValues>
  /** Alters the value of the input during the field's onChange event. */
  transform?: (value: string) => FieldPathValue<TFieldValues, TName>
}

export function TextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label = capitalize(name),
  units,
  tooltipText,
  description,
  required,
  ...props
}: Omit<TextFieldProps<TFieldValues, TName>, 'id'> & UITextAreaProps) {
  // id is omitted from props because we generate it here
  const id = useId()
  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel htmlFor={id} id={`${id}-label`} tip={tooltipText} optional={!required}>
          {label} {units && <span className="ml-1 text-secondary">({units})</span>}
        </FieldLabel>
        {description && (
          <TextInputHint id={`${id}-help-text`} className="mb-2">
            {description}
          </TextInputHint>
        )}
      </div>
      {/* passing the generated id is very important for a11y */}
      <TextFieldInner name={name} {...props} id={id} />
    </div>
  )
}

/**
 * Primarily exists for `TextField`, but we occasionally also need a plain field
 * without a label on it.
 *
 * Note that `id` is an allowed prop, unlike in `TextField`, where it is always
 * generated from `name`. This is because we need to pass the generated ID in
 * from there to here. For the case where `TextFieldInner` is used
 * independently, we also generate an ID for use only if none is passed in.
 */
export const TextFieldInner = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  type = 'text',
  label = capitalize(name),
  validate,
  control,
  tooltipText,
  required,
  id: idProp,
  transform,
  ...props
}: TextFieldProps<TFieldValues, TName> & UITextAreaProps) => {
  const generatedId = useId()
  const id = idProp || generatedId
  return (
    <Controller
      name={name}
      control={control}
      rules={{ required, validate }}
      render={({ field: { onChange, ...fieldRest }, fieldState: { error } }) => {
        return (
          <>
            <UITextField
              id={id}
              title={label}
              type={type}
              error={!!error}
              aria-labelledby={cn(`${id}-label`, {
                [`${id}-help-text`]: !!tooltipText,
              })}
              aria-describedby={tooltipText ? `${id}-label-tip` : undefined}
              onChange={(e) => {
                onChange(transform ? transform(e.target.value) : e.target.value)
              }}
              {...fieldRest}
              {...props}
            />
            <ErrorMessage error={error} label={label} />
          </>
        )
      }}
    />
  )
}
