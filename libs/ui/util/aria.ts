/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// neat trick for requiring aria-labelledby XOR aria-label on a component
//
//   type Props = { ...otherProps } & AriaLabel
//
// then use {...ariaLabel(props)} to put whichever one is actually there on the
// thing. This is better than { aria-labelledby?: string; aria-label?: string }
// because that lets you get away with neither (unless you check at runtime, ew)

export type AriaLabel =
  | {
      'aria-labelledby': string
      'aria-label'?: never
    }
  | {
      'aria-labelledby'?: never
      'aria-label': string
    }

export const ariaLabel = (props: AriaLabel) =>
  'aria-labelledby' in props
    ? { 'aria-labelled-by': props['aria-labelledby'] }
    : { 'aria-label': props['aria-label'] }
