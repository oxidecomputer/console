import cn from 'classnames'
import type { FieldValidator } from 'formik'
import { Controller } from 'react-hook-form'

import type {
  TextAreaProps as UITextAreaProps,
  TextInputBaseProps as UITextFieldProps,
} from '@oxide/ui'
import { TextInputError } from '@oxide/ui'
import { TextInputHint } from '@oxide/ui'
import { FieldLabel, TextInput as UITextField } from '@oxide/ui'
import { capitalize } from '@oxide/util'

export interface TextFieldProps extends UITextFieldProps {
  id: string
  /** Will default to id if not provided */
  name?: string
  /** HTML type attribute, defaults to text */
  type?: string
  /** Will default to name if not provided */
  label?: string
  /**
   * Displayed inline as supplementary text to the label. Should
   * only be used for text that's necessary context for helping
   * complete the input. This will be announced in tandem with the
   * label when using a screen reader.
   */
  helpText?: string
  /**
   * Displayed in a tooltip beside the title. This field should be used
   * for auxiliary context that helps users understand extra context about
   * a field but isn't specifically required to know how to complete the input.
   * This is announced as an `aria-description`
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-description
   */
  description?: string
  placeholder?: string
  units?: string
  validate?: FieldValidator
}

export function TextField({
  id,
  name = id,
  type = 'text',
  label = capitalize(name),
  units,
  validate,
  ...props
}: TextFieldProps & UITextAreaProps) {
  const { description, helpText, required } = props
  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
          {label} {units && <span className="ml-1 text-secondary">({units})</span>}
        </FieldLabel>
      </div>
      {helpText && <TextInputHint id={`${id}-help-text`}>{helpText}</TextInputHint>}
      <Controller
        name={name}
        render={({ field, formState }) => (
          <UITextField
            id={id}
            title={label}
            type={type}
            error={!!formState.errors[name]}
            aria-labelledby={cn(`${id}-label`, {
              [`${id}-help-text`]: !!description,
            })}
            aria-describedby={description ? `${id}-label-tip` : undefined}
            {...field}
            {...props}
          />
        )}
      />
      {/* <TextInputError>{meta.error}</TextInputError> */}
    </div>
  )
}
