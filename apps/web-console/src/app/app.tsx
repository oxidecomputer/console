import React from 'react'

import styled from 'styled-components'

import { Button, Icon } from '@oxide/ui'
import { InstancePageTables } from './InstancePageTables'

const StyledApp = styled.div`
  min-width: 300px;
  max-width: 600px;
  margin: 50px auto;

  .gutter-left {
    margin-left: 9px;
  }

  .col-span-2 {
    grid-column: span 2;
  }

  .flex {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  header {
    background-color: #143055;
    color: white;
    padding: 5px;
    border-radius: 3px;
  }

  main {
    padding: 0 36px;
  }

  h1 {
    text-align: center;
    margin-left: 18px;
    font-size: 24px;
  }

  h2 {
    text-align: center;
    font-size: 20px;
    margin: 40px 0 10px 0;
  }

  button {
    display: inline-flex;
  }

  svg {
    margin-right: ${({ theme }) => theme.spacing(1)};
  }
`

export const App = () => {
  return (
    <StyledApp>
      <header className="flex">
        <h1>Welcome to web-console!</h1>
      </header>
      <main>
        <InstancePageTables />
        <h2>A button imported from @oxide/ui with an SVG icon inside</h2>
        <Button size="base" variant="solid">
          <Icon name="plus" />
          Hello I don&apos;t do anything
        </Button>
      </main>
    </StyledApp>
  )
}

export default App
