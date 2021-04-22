import styled, { css } from 'styled-components'
import type { FieldProps } from '../types'

export * from './label'
export * from './hint'
export * from './error'
export * from './info-popover'

export const Container = styled.div<Pick<FieldProps, 'disabled'>>`
  color: ${({ theme }) => theme.color('gray100')};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.4;
    `}
`

export const InputContainer = styled.div<Pick<FieldProps, 'error'>>`
  display: flex;
  flex-direction: row;

  background-color: ${({ theme }) => theme.color('gray700')};
  border: 1px solid transparent;

  :focus-within {
    border-color: ${({ theme, error }) =>
      theme.color(error ? 'red500' : 'green500')};
    ${({ theme, error }) =>
      error
        ? css`
            box-shadow: 0px 1px 2px ${theme.color('black', 0.05)},
              0px 0px 0px 1px #ef4444;
          `
        : css`
            box-shadow: 0px 0px 0px 1px ${theme.color('green500')};
          `}
  }

  > input {
    flex: 1;
  }
`
