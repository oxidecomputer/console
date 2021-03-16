import React, { FC, useState, useCallback } from 'react'

import styled from 'styled-components'

import { Button } from '../button/Button'

export interface TabsProps {
  tabs: string[]
}

const Wrapper = styled.div`
  color: pink;
`

const StyledButton = styled(Button).attrs({
  size: 'base',
  variant: 'ghost',
})`
  border-bottom: 1px solid currentColor;
`

export const Tabs: FC<TabsProps> = ({ tabs }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(1)
  const handleClick = useCallback(
    (ev) => {
      const nextTabIndex = ev.target.id
      setCurrentTabIndex(nextTabIndex)
      console.log('handleClick', nextTabIndex)
    },
    [setCurrentTabIndex]
  )

  const renderTabs =
    tabs && tabs.length
      ? tabs.map((tab, index) => {
          const tabIndex = index + 1
          const isSelected = currentTabIndex === tabIndex
          return (
            <StyledButton
              aria-controls={`tabpanel-${tabIndex}`}
              aria-selected={isSelected}
              id={`${tabIndex}`}
              onClick={handleClick}
              role="tab"
            >
              {tab}
            </StyledButton>
          )
        })
      : null

  return (
    <Wrapper>
      <div role="tablist" aria-label="Entertainment">
        {renderTabs}
      </div>

      <div tabindex="0" role="tabpanel" id="nils-tab" aria-labelledby="nils">
        <p>
          Nils Frahm is a German musician, composer and record producer based in
          Berlin. He is known for combining classical and electronic music and
          for an unconventional approach to the piano in which he mixes a grand
          piano, upright piano, Roland Juno-60, Rhodes piano, drum machine, and
          Moog Taurus.
        </p>
      </div>

      <div
        tabindex="0"
        role="tabpanel"
        id="agnes-tab"
        aria-labelledby="agnes"
        hidden=""
      >
        <p>
          Agnes Caroline Thaarup Obel is a Danish singer/songwriter. Her first
          album, Philharmonics, was released by PIAS Recordings on 4 October
          2010 in Europe. Philharmonics was certified gold in June 2011 by the
          Belgian Entertainment Association (BEA) for sales of 10,000 Copies.
        </p>
      </div>

      <div
        tabindex="0"
        role="tabpanel"
        id="complexcomplex"
        aria-labelledby="complex"
        hidden=""
      >
        <p>Fear of complicated buildings:</p>
        <p>A complex complex complex.</p>
      </div>
    </Wrapper>
  )
}

export default Tabs
