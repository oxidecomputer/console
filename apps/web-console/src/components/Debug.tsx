import { color } from '@oxide/css-helpers'
import type { FC } from 'react'
import React from 'react'
import { useLocation } from 'react-router-dom'

import { styled } from 'twin.macro'

const Wrapper = styled.div`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;

  margin: 2rem;
  padding: 1rem;

  background: ${color('white', 0.5)};
  border: 1px solid ${color('white')};
  color: ${color('black')};
`

// from https://reactrouter.com/web/example/query-parameters
function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function useDebug() {
  const query = useQuery()
  return !!query.get('debug')
}

export const Debug: FC = ({ children }) => {
  const debug = useDebug()
  return debug ? <Wrapper>{children}</Wrapper> : null
}
