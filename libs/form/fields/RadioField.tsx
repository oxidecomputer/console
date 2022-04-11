import type { RadioGroupProps } from '@oxide/ui'
import { FieldLabel, RadioGroup, TextFieldHint } from '@oxide/ui'
import cn from 'classnames'
import React from 'react'

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
}

export function RadioField({
  id,
  name = id,
  label,
  helpText,
  description,
  ...props
}: RadioFieldProps) {
  return (
    <fieldset
      aria-describedby={cn({
        [`${id}-help-text`]: !!helpText,
        [`${id}-label-tip`]: !!description,
      })}
    >
      {label && (
        <FieldLabel id={`${id}-label`} as={'legend'} tip={description}>
          {label}
        </FieldLabel>
      )}
      {/* TODO: Figure out where this hint field def should live */}
      {helpText && (
        <TextFieldHint id={`${id}-help-text`}>{helpText}</TextFieldHint>
      )}
      <RadioGroup name={name} {...props} />
    </fieldset>
  )
}

export { Radio } from '@oxide/ui'
