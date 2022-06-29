import cn from 'classnames'

import type {
  TextAreaProps as UITextAreaProps,
  TextFieldBaseProps as UITextFieldProps,
} from '@oxide/ui'
import { TextFieldError } from '@oxide/ui'
import { TextFieldHint } from '@oxide/ui'
import { FieldLabel, TextField as UITextField } from '@oxide/ui'
import { capitalize } from '@oxide/util'

import { useFieldError } from '../../../hooks/useFieldError'

export interface TextFieldProps extends UITextFieldProps {
  id: string
  /** Will default to id if not provided */
  name?: string
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
}

export function TextField({
  id,
  name = id,
  label = capitalize(name),
  units,
  ...props
}: TextFieldProps & UITextAreaProps) {
  const { description, helpText, required } = props
  const error = useFieldError(name)
  return (
    <div className="max-w-lg">
      <FieldLabel id={`${id}-label`} tip={description} optional={!required}>
        {label} {units && <span className="ml-1 text-secondary">({units})</span>}
      </FieldLabel>
      {helpText && <TextFieldHint id={`${id}-help-text`}>{helpText}</TextFieldHint>}
      <UITextField
        id={id}
        name={name}
        title={label}
        error={!!error}
        aria-labelledby={cn(`${id}-label`, {
          [`${id}-help-text`]: !!description,
        })}
        aria-describedby={description ? `${id}-label-tip` : undefined}
        {...props}
      />
      <TextFieldError name={name} />
    </div>
  )
}
