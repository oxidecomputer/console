import cn from 'classnames'

import type { RadioGroupProps } from '@oxide/ui'
import { FieldLabel, RadioGroup, TextFieldHint } from '@oxide/ui'

// TODO: Centralize these docstrings perhaps on the `FieldLabel` component?
export interface RadioFieldProps extends Omit<RadioGroupProps, 'name'> {
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

export function RadioField({
  id,
  name = id,
  label,
  helpText,
  description,
  units,
  ...props
}: RadioFieldProps) {
  return (
    <div>
      <div className="mb-2">
        {label && (
          <FieldLabel id={`${id}-label`} tip={description}>
            {label} {units && <span className="ml-1 text-secondary">({units})</span>}
          </FieldLabel>
        )}
        {/* TODO: Figure out where this hint field def should live */}
        {helpText && <TextFieldHint id={`${id}-help-text`}>{helpText}</TextFieldHint>}
      </div>
      <RadioGroup
        name={name}
        aria-labelledby={cn(`${id}-label`, {
          [`${id}-help-text`]: !!description,
        })}
        aria-describedby={description ? `${id}-label-tip` : undefined}
        {...props}
      />
    </div>
  )
}

export { Radio } from '@oxide/ui'
