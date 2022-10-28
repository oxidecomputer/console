import cn from 'classnames'
import type { Control, FieldPath, FieldValues, PathValue } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type { RadioGroupProps } from '@oxide/ui'
import { Radio } from '@oxide/ui'
import { FieldLabel, RadioGroup, TextInputHint } from '@oxide/ui'
import { capitalize } from '@oxide/util'

export interface RadioFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> extends Omit<RadioGroupProps, 'name' | 'children'> {
  name: TName
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
  control: Control<TFieldValues>
  items: { value: PathValue<TFieldValues, TName>; label: string }[]
  /**
   * Radio field values are always strings internally, but sometimes we want
   * them to represent something else, like a number. Default is no transform.
   */
  parseValue?: (str: string) => PathValue<TFieldValues, TName>
}

export function RadioField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  label = capitalize(name),
  helpText,
  description,
  units,
  control,
  items,
  // Cast is required by the type on the prop. Let's assume that if the inputs
  // are good then calling identity on them is also good.
  parseValue = (x) => x as PathValue<TFieldValues, TName>,
  ...props
}: RadioFieldProps<TFieldValues, TName>) {
  const id: string = name
  return (
    <div>
      <div className="mb-2">
        {label && (
          <FieldLabel id={`${id}-label`} tip={description}>
            {label} {units && <span className="ml-1 text-secondary">({units})</span>}
          </FieldLabel>
        )}
        {/* TODO: Figure out where this hint field def should live */}
        {helpText && <TextInputHint id={`${id}-help-text`}>{helpText}</TextInputHint>}
      </div>
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, name } }) => (
          <RadioGroup
            defaultChecked={value}
            aria-labelledby={cn(`${id}-label`, {
              [`${id}-help-text`]: !!description,
            })}
            aria-describedby={description ? `${id}-label-tip` : undefined}
            onChange={(e) => onChange(parseValue(e.target.value))}
            name={name}
            {...props}
            // TODO: once we get rid of the other use of RadioGroup, change RadioGroup
            // to take the list of items too
          >
            {items.map(({ value, label }) => (
              <Radio key={value} value={value}>
                {label}
              </Radio>
            ))}
          </RadioGroup>
        )}
      />
    </div>
  )
}

export { Radio } from '@oxide/ui'
