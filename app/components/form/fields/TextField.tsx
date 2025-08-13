/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  useController,
  type Control,
  type FieldPath,
  type FieldPathValue,
  type FieldValues,
  type Validate,
} from 'react-hook-form'

import {
  TextInput as UITextField,
  type TextAreaProps as UITextAreaProps,
  type TextInputBaseProps as UITextFieldProps,
} from '~/ui/lib/TextInput'
import { capitalize } from '~/util/str'

import { FieldWrapper } from './FieldWrapper'

export interface TextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> extends UITextFieldProps {
  variant?: 'default' | 'inline'
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
  placeholder?: string
  units?: string
  validate?: Validate<FieldPathValue<TFieldValues, TName>, TFieldValues>
  control: Control<TFieldValues>
  /** Alters the value of the input during the field's onChange event. */
  transform?: (value: string) => string
}

export function TextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  variant = 'default',
  name,
  type = 'text',
  label = capitalize(name),
  units,
  description,
  required,
  control,
  validate,
  transform,
  ...props
}: Omit<TextFieldProps<TFieldValues, TName>, 'id'> & UITextAreaProps) {
  const {
    field: { onChange, ...fieldRest },
    fieldState: { error },
  } = useController({ name, control, rules: { required, validate } })

  const labelWithUnits = units ? (
    <>
      {label} <span className="ml-1 text-default">({units})</span>
    </>
  ) : (
    label
  )

  return (
    <FieldWrapper
      variant={variant}
      label={labelWithUnits}
      description={description}
      required={required}
      error={error}
      errorLabel={label}
    >
      {({ id, 'aria-labelledby': ariaLabelledBy }) => (
        <UITextField
          id={id}
          title={label}
          type={type}
          error={!!error}
          aria-labelledby={ariaLabelledBy}
          onChange={(e) => onChange(transform ? transform(e.target.value) : e.target.value)}
          {...fieldRest}
          {...props}
        />
      )}
    </FieldWrapper>
  )
}
