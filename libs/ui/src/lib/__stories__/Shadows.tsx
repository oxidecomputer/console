import type { ShadowVariant } from '@oxide/theme'
import React from 'react'
import styled from 'styled-components'
import Text from '../text/Text'

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.color('gray700')};
`

const ShadowBox = styled.div<{ shadow?: ShadowVariant }>`
  height: 100px;
  width: 100%;

  border: 1px solid ${({ theme }) => theme.color('gray600')};
  border-radius: 1em;

  padding: ${({ theme }) => theme.spacing(4)};
  ${({ theme }) => theme.marginY(4)};

  ${({ theme, shadow }) => theme.shadow(shadow)};
`

const shadowVariants = [
  'sm',
  undefined,
  'md',
  'lg',
  'xl',
  '2xl',
  'inner',
] as const

export const AllShadows = () => (
  <Wrapper>
    {shadowVariants.map((v) => (
      <>
        <Text size="lg" color="gray50" font="sans">
          {v || 'base'}
        </Text>
        <br />
        <Text size="base" color="gray100" font="mono">
          {`\${({ theme }) => theme.shadow(${(v && `'${v}'`) || ''})}`}
        </Text>
        <ShadowBox key={v} shadow={v}></ShadowBox>
      </>
    ))}
  </Wrapper>
)
