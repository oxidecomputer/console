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
  type FieldValues,
  type PathValue,
} from 'react-hook-form'

import { Radio, type RadioProps } from '~/ui/lib/Radio'
import { RadioGroup, type RadioGroupProps } from '~/ui/lib/RadioGroup'
import { capitalize } from '~/util/str'

import { FieldWrapper } from './FieldWrapper'

type RadioElt = React.ReactElement<RadioProps>

// Base props shared by both usage patterns
type RadioFieldBaseProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<RadioGroupProps, 'name' | 'children'> & {
  variant?: 'default' | 'inline'
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
  required?: boolean
  hideOptionalTag?: boolean
  control: Control<TFieldValues>
}

// Items-based pattern with type safety
type RadioFieldItemsProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RadioFieldBaseProps<TFieldValues, TName> & {
  /** Use items for auto-generated Radio children with type safety */
  items: { value: PathValue<TFieldValues, TName>; label: string }[]
  children?: never
} & (PathValue<TFieldValues, TName> extends string
    ? { parseValue?: never }
    : {
        /**
         * Radio field values are always strings internally, but sometimes we
         * want them to represent something else, like a number. `parseValue` is
         * required if and only if the value type does not extend `string`.
         */
        parseValue: (str: string) => PathValue<TFieldValues, TName>
      })

// Children-based pattern for custom components
type RadioFieldChildrenProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RadioFieldBaseProps<TFieldValues, TName> & {
  /** Use children for custom Radio components */
  children: RadioElt | RadioElt[]
  items?: never
  parseValue?: never
}

// Union of both patterns
export type RadioFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = RadioFieldItemsProps<TFieldValues, TName> | RadioFieldChildrenProps<TFieldValues, TName>

/**
 * A flexible radio field component that supports two usage patterns:
 *
 * 1. Items-based (recommended for simple cases):
 * ```tsx
 * <RadioField
 *   name="policy"
 *   control={control}
 *   items={[
 *     { value: 'allow', label: 'Allow' },
 *     { value: 'deny', label: 'Deny' },
 *   ]}
 * />
 * ```
 *
 * 2. Children-based (for custom Radio components like radio cards):
 * ```tsx
 * <RadioField name="presetId" control={control}>
 *   <RadioCard value="general-sm">
 *     <div>4 <RadioCard.Unit>vCPUs</RadioCard.Unit></div>
 *     <div>16 <RadioCard.Unit>GiB RAM</RadioCard.Unit></div>
 *   </RadioCard>
 *   <RadioCard value="general-lg">
 *     <div>16 <RadioCard.Unit>vCPUs</RadioCard.Unit></div>
 *     <div>64 <RadioCard.Unit>GiB RAM</RadioCard.Unit></div>
 *   </RadioCard>
 * </RadioField>
 * ```
 */
export function RadioField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  variant = 'default',
  name,
  label = capitalize(name),
  description,
  units,
  required,
  hideOptionalTag,
  control,
  items,
  children,
  parseValue,
  ...props
}: RadioFieldProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({ name, control, rules: { required } })

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
      hideOptionalTag={hideOptionalTag}
      error={fieldState.error}
      errorLabel={label}
    >
      {({ 'aria-labelledby': ariaLabelledBy }) => (
        <RadioGroup
          defaultChecked={field.value}
          aria-labelledby={ariaLabelledBy}
          onChange={
            items && parseValue
              ? (e) => field.onChange(parseValue(e.target.value))
              : field.onChange
          }
          name={field.name}
          {...props}
        >
          {children ||
            items?.map(({ value, label }) => (
              <Radio key={value} value={value}>
                {label}
              </Radio>
            ))}
        </RadioGroup>
      )}
    </FieldWrapper>
  )
}
