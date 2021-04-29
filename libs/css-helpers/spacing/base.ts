import { css } from 'styled-components'

// Used as a basis for an CSS helper which relies on a base sizing unit.
export type SizingMultiplier = number

// Spacing is based on Tailwind's default spacing scale. See: https://tailwindcss.com/docs/customizing-spacing#default-spacing-scale
// Usage: `theme.spacing(4)`          => '1rem' (16px)
//        `theme.spacing(4, 4, 4, 4)` => '1rem 1rem 1rem 1rem'
//
// Dev Note: Eventually most commonly used numbers will map to strings e.g. `theme.spacing('small')`
export const spacing = (...sizes: SizingMultiplier[]): string =>
  sizes.map((n) => `${n * 0.25}rem`).join(' ')

/**
 * Adds horizontal space between all direct children of this element.
 *
 * @param size The size of the distance between child elements
 */
export const spaceBetweenX = (size: SizingMultiplier) => css`
  & > * + * {
    margin-left: ${spacing(size)};
    margin-right: 0;
  }
`

/**
 * Adds vertical space between all direct children of this element.
 *
 * @param size The size of the distance between child elements
 */
export const spaceBetweenY = (size: SizingMultiplier) => css`
  & > * + * {
    margin-top: ${spacing(size)};
    margin-bottom: 0;
  }
`
