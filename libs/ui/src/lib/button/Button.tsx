import React from 'react'

import styled, { css } from 'styled-components'

export const sizes = ['xs', 'sm', 'base', 'lg'] as const
export const variants = ['solid', 'outline', 'ghost', 'link'] as const

type Size = typeof sizes[number]
type Variant = typeof variants[number]

export interface ButtonProps {
  /**
   * Set the size of the button
   */
  size: Size
  /**
   * Style variation or button styles
   */
  variant: Variant
  /**
   * Disable button
   */
  disabled?: boolean
}

const getSizeStyles = (size: Size) => {
  switch (size) {
    case 'xs':
      return css`
        font-size: 0.75rem;
        line-height: ${1 / 0.75};
        padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(3)}`};
      `
    case 'sm':
      return css`
        font-size: 0.75rem;
        line-height: ${1 / 0.75};
        padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
      `
    case 'lg':
      return css`
        font-size: 1.125rem;
        line-height: ${1.75 / 1.125};
        padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(6)}`};
      `
    case 'base':
    default:
      return css`
        font-size: 0.875rem;
        line-height: ${1.25 / 0.875};
        padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
      `
  }
}

const getVariantStyles = (variant: Variant) => {
  switch (variant) {
    case 'outline':
      return css`
        background-color: ${({ theme }) => theme.themeColors.white};
        box-shadow: inset 0 0 0 1px ${({ theme }) => theme.themeColors.green500};
        color: ${({ theme }) => theme.themeColors.green500};

        &:hover:not(:disabled):not([disabled]) {
          background-color: ${({ theme }) => theme.themeColors.green50};
        }

        &:disabled,
        [disabled] {
          opacity: 0.4;
        }
      `
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.themeColors.green500};

        &:hover:not(:disabled):not([disabled]) {
          background-color: ${({ theme }) => theme.themeColors.green50};
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

        &:hover:not(:disabled):not([disabled]) {
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
          background-color: ${({ theme }) => theme.themeColors.green600};
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
`

export const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <StyledButton type="button" {...rest}>
      {children}
    </StyledButton>
  )
}

Button.defaultProps = {
  size: 'base',
  variant: 'solid',
}

export default Button
