/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import React, { useId } from 'react'
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type PathValue,
} from 'react-hook-form'

import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Radio } from '~/ui/lib/Radio'
import { RadioGroup, type RadioGroupProps } from '~/ui/lib/RadioGroup'
import { TextInputHint } from '~/ui/lib/TextInput'
import { capitalize } from '~/util/str'

export type RadioFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
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
  description?: string | React.ReactNode
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
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label = capitalize(name),
  description,
  units,
  control,
  items,
  parseValue,
  ...props
}: RadioFieldProps<TFieldValues, TName>) {
  const id = useId()
  const { field } = useController({ name, control })
  return (
    <div>
      <div className="mb-2">
        {label && (
          <FieldLabel id={`${id}-label`}>
            {label} {units && <span className="ml-1 text-secondary">({units})</span>}
          </FieldLabel>
        )}
        {/* TODO: Figure out where this hint field def should live */}
        {description && <TextInputHint id={`${id}-help-text`}>{description}</TextInputHint>}
      </div>
      <RadioGroup
        defaultChecked={field.value}
        aria-labelledby={`${id}-label`}
        onChange={(e) =>
          parseValue ? field.onChange(parseValue(e.target.value)) : field.onChange(e)
        }
        name={field.name}
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
    </div>
  )
}

export type RadioFieldDynProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<RadioFieldProps<TFieldValues, TName>, 'parseValue' | 'items'> & {
  children: React.ReactElement | React.ReactElement[]
}

/**
 * Same as RadioField, except instead of a statically typed `items` prop, we use
 * children to render arbitrary Radio components and therefore cannot guarantee
 * anything about the `value` attrs on the radios. This is needed for radio
 * cards like the image picker on instance create.
 */
export function RadioFieldDyn<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  name,
  label = capitalize(name),
  description,
  units,
  control,
  children,
  ...props
}: RadioFieldDynProps<TFieldValues, TName>) {
  const id = useId()
  const { field } = useController({ name, control })
  return (
    <div>
      <div className="mb-2">
        {label && (
          <FieldLabel id={`${id}-label`}>
            {label} {units && <span className="ml-1 text-secondary">({units})</span>}
          </FieldLabel>
        )}
        {/* TODO: Figure out where this hint field def should live */}
        {description && <TextInputHint id={`${id}-help-text`}>{description}</TextInputHint>}
      </div>
      <RadioGroup
        defaultChecked={field.value}
        aria-labelledby={cn(`${id}-label`)}
        onChange={field.onChange}
        name={field.name}
        {...props}
      >
        {children}
      </RadioGroup>
    </div>
  )
}
