import { css } from 'styled-components'

export type ShadowVariant = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'

export const shadow = (variant?: ShadowVariant) => {
  if (!variant) {
    return css`
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.1);
    `
  }

  switch (variant) {
    case 'sm':
      return css`
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      `
    case 'md':
      return css`
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06),
          0 4px 6px -1px rgba(0, 0, 0, 0.1);
      `
    case 'lg':
      return css`
        box-shadow: 0px 4px 6px -2px rgba(0, 0, 0, 0.05),
          0px 10px 15px -3px rgba(0, 0, 0, 0.1);
      `
    case 'xl':
      return css`
        box-shadow: 0px 10px 10px -5px rgba(0, 0, 0, 0.04),
          0px 20px 25px -5px rgba(0, 0, 0, 0.1);
      `
    case '2xl':
      return css`
        box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
      `
    case 'inner':
      return css`
        box-shadow: inset 0px 2px 4px rgba(0, 0, 0, 0.06);
      `
  }
}
