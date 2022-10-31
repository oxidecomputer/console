import cn from 'classnames'
import React from 'react'
import type { Control, FieldPath, FieldValues, PathValue } from 'react-hook-form'
import { Controller } from 'react-hook-form'

import type { RadioGroupProps } from '@oxide/ui'
import { Radio } from '@oxide/ui'
import { FieldLabel, RadioGroup, TextInputHint } from '@oxide/ui'
import { capitalize } from '@oxide/util'

import { useUuid } from 'app/hooks'

export type RadioFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = Omit<RadioGroupProps, 'name' | 'children'> & {
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
} & (PathValue<TFieldValues, TName> extends string // this is wild lmao
    ? { parseValue?: never }
    : {
        /**
         * Radio field values are always strings internally, but sometimes we
         * want them to represent something else, like a number. `parseValue` is
         * required if and only if the value type does not extend `string`.
         */
        parseValue: (str: string) => PathValue<TFieldValues, TName>
      })

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
  parseValue,
  ...props
}: RadioFieldProps<TFieldValues, TName>) {
  const id = useUuid(name)
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
            onChange={(e) =>
              parseValue ? onChange(parseValue(e.target.value)) : onChange(e)
            }
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

export type RadioFieldProps2<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = Omit<RadioFieldProps<TFieldValues, TName>, 'parseValue' | 'items'> & {
  children: React.ReactNode
}

export function RadioField2<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  label = capitalize(name),
  helpText,
  description,
  units,
  control,
  children,
  ...props
}: RadioFieldProps2<TFieldValues, TName>) {
  const id = useUuid(name)
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
            onChange={onChange}
            name={name}
            {...props}
          >
            {children}
          </RadioGroup>
        )}
      />
    </div>
  )
}
