import React, { PropsWithChildren, forwardRef } from 'react'

import styled, { css } from 'styled-components'

export const buttonSizes = ['xs', 'sm', 'base', 'lg', 'xl'] as const
export const variants = ['ghost', 'link', 'outline', 'solid', 'subtle'] as const

export type ButtonSize = typeof buttonSizes[number]
export type Variant = typeof variants[number]

const sizes = {
  xs: { fontSize: 3, lineHeight: 1 / 0.75, padding: [2, 3] }, // total height: 32px
  sm: { fontSize: 3.5, lineHeight: 1.25 / 0.875, padding: [2, 3] }, // total height: 36px
  base: { fontSize: 3.5, lineHeight: 1.25 / 0.875, padding: [2.5, 4] }, // total height: 40px
  lg: { fontSize: 4, lineHeight: 1.5, padding: [2.25, 4.5] }, // total height: 42px
  xl: { fontSize: 4, lineHeight: 1.5, padding: [3, 6] }, // total height: 48px
}

export interface ButtonProps {
  /**
   * Set an optional id
   */
  id?: string
  /**
   * Explicitly set an ARIA role, e.g. role="tab" for the Tabs component
   */
  role?: string
  /**
   * Set the size of the button
   */
  size?: ButtonSize
  /**
   * Style variation or button styles
   */
  variant?: Variant
  /**
   * Disable button
   */
  disabled?: boolean
  /**
   * Handle click events
   */
  onClick?: (event) => void
  onKeyDown?: (event) => void
  onKeyUp?: (event) => void
}

const getSizeStyles = (size: ButtonSize) => {
  const getPadding = (x, y) => {
    return ({ theme }) => `${theme.spacing(x)} ${theme.spacing(y)}`
  }

  const buttonSize = sizes[size]

  if (buttonSize) {
    return css`
      font-size: ${({ theme }) => theme.spacing(buttonSize.fontSize)};
      line-height: ${buttonSize.lineHeight};
      padding: ${getPadding(buttonSize.padding[0], buttonSize.padding[1])};
    `
  }

  return css``
}

const getVariantStyles = (variant: Variant) => {
  switch (variant) {
    case 'subtle':
      return css`
        background-color: hsla(154, 50%, 50%, 0.16);
        color: ${({ theme }) => theme.themeColors.green400};

        &:hover:not(:disabled):not([disabled]) {
          background-color: hsla(153, 63%, 69%, 0.24);
        }

        &:focus {
          background-color: hsla(154, 63%, 56%, 0.16);
          box-shadow: 0 0 0 ${({ theme }) => theme.spacing(1)}
            rgba(65, 192, 136, 0.16);
        }

        &:disabled,
        [disabled] {
          opacity: 0.4;
        }
      `
    case 'outline':
      return css`
        background-color: hsla(146, 51%, 64%, 0.16);
        box-shadow: inset 0 0 0 1px ${({ theme }) => theme.themeColors.green500};
        color: ${({ theme }) => theme.themeColors.green400};

        &:hover:not(:disabled):not([disabled]) {
          background-color: hsla(146, 51%, 64%, 0.08);
        }

        &:focus {
          box-shadow: ${({ theme }) => `
            inset 0 0 0 1px ${theme.themeColors.green500},
            0px 1px ${theme.spacing(0.5)} rgba(0, 0, 0, 0.05),
            0px 0px 0px ${theme.spacing(0.5)} hsla(146, 51%, 64%, 0.16),
            0px 0px 0px ${theme.spacing(1)} hsla(145, 39%, 57%, 0.16)
            `};
        }

        &:disabled,
        [disabled] {
          opacity: 0.4;
        }
      `
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.themeColors.green400};

        &:hover:not(:disabled):not([disabled]) {
          background-color: hsla(146, 51%, 64%, 0.08);
        }

        &:focus {
          background-color: hsla(146, 51%, 64%, 0.16);
        }

        &:disabled,
        [disabled] {
          opacity: 0.4;
        }
      `
    case 'link':
      return css`
        padding: 0;
        background-color: transparent;
        color: ${({ theme }) => theme.themeColors.green500};

        &:hover:not(:disabled):not([disabled]),
        &:focus {
          text-decoration: underline;
        }

        &:disabled,
        [disabled] {
          opacity: 0.4;
        }
      `
    case 'solid':
    default:
      return css`
        background-color: ${({ theme }) => theme.themeColors.green500};
        color: ${({ theme }) => theme.themeColors.green50};

        &:hover:not(:disabled):not([disabled]) {
          background-color: ${({ theme }) => theme.themeColors.green700};
        }

        &:focus {
          box-shadow: ${({ theme }) => `
            0 1px ${theme.spacing(0.5)} rgba(0, 0, 0, 0.05),
            0 0 0 ${theme.spacing(0.5)} ${theme.themeColors.gray800},
            0 0 0 ${theme.spacing(1)} ${theme.themeColors.green600}`};
        }

        &:disabled,
        [disabled] {
          opacity: 0.64;
        }
      `
  }
}

const StyledButton = styled.button<ButtonProps>`
  border: none;
  border-radius: 0;
  text-transform: uppercase;

  ${(props) => getSizeStyles(props.size)};
  ${(props) => getVariantStyles(props.variant)};

  &:disabled,
  [disabled] {
    cursor: not-allowed;
  }
`
// Use `forwardRef` so the ref points to the DOM element (not the React Component)
// so it can be focused using the DOM API (eg. this.buttonRef.current.focus())
export const Button = forwardRef<
  HTMLButtonElement,
  PropsWithChildren<ButtonProps>
>(({ children, size = 'base', variant = 'solid', ...rest }, ref) => {
  return (
    <StyledButton
      ref={ref}
      type="button"
      size={size}
      variant={variant}
      {...rest}
    >
      {children}
    </StyledButton>
  )
})

export default Button
