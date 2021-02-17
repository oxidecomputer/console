import React from 'react'

import styled from 'styled-components'

/* eslint-disable-next-line */
export interface ThemeProps {}

const StyledTheme = styled.div`
  color: pink;
`

export function Theme(props: ThemeProps) {
  return (
    <StyledTheme>
      <h1>Welcome to theme!</h1>
    </StyledTheme>
  )
}

export default Theme
