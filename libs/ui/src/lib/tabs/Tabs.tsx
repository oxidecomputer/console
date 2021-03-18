import React, { FC, useState, useCallback, useEffect, createRef } from 'react'

import styled, { css } from 'styled-components'

import { Button } from '../button/Button'
import { KEYS } from '../keys-utils'

export interface TabsProps {
  /**
   * A short description for the Tabs. It gets passed to `aria-label`
   */
  label: string
  /**
   * An array of each tab name
   */
  tabs: string[]
  panels: Array<React.ReactNode>
}

const Wrapper = styled.div``

const TabList = styled.div``

const StyledButton = styled(Button).attrs({
  size: 'base',
  variant: 'ghost',
})<{ isSelected: boolean }>`
  ${({ isSelected, theme }) =>
    isSelected
      ? css`
          color: ${theme.color('green500')};
        `
      : css`
          color: ${theme.color('green50')};
        `}

  border-bottom: 1px solid currentColor;

  &:hover {
    color: ${({ theme }) => theme.color('green500')};
  }
`

const Panel = styled.div<{ isVisible: boolean }>`
  ${({ isVisible }) =>
    isVisible
      ? null
      : css`
          display: none;
        `}
`

// Add or subtract depending on key pressed
const DIRECTION = {
  [KEYS.left]: -1, // retreat
  [KEYS.right]: 1, // advance
}

export const Tabs: FC<TabsProps> = ({ label, tabs, panels }) => {
  const [refs, setRefs] = useState([])
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    // create refs for all the tabs
    const initialize = new Array(tabs.length)
      .fill('')
      .map((item, index) => refs[index] || createRef())
    setRefs(initialize)
  }, tabs)

  const handleClick = useCallback(
    (index) => () => {
      setActiveTab(index)
    },
    [setActiveTab]
  )

  const handleKeydown = useCallback(
    (event) => {
      const { keyCode } = event
      switch (keyCode) {
        case KEYS.end:
          event.preventDefault()
          // Activate last tab
          setActiveTab(tabs.length - 1)
          break
        case KEYS.home:
          event.preventDefault()
          // Activiate first tab
          setActiveTab(0)
          break
        case KEYS.up:
        case KEYS.down:
          // Up and down are in keydown
          // because we need to prevent page scroll
          // Do nothing
          break
      }
    },
    [setActiveTab, tabs]
  )

  const handleKeyup = useCallback(
    (index) => (event) => {
      const { keyCode } = event

      switch (keyCode) {
        case KEYS.left:
        case KEYS.right:
          event.preventDefault()
          // Either focus the next, previous, first, or last tab, depending on key pressed
          if (DIRECTION[keyCode]) {
            // Modulus allows the end to circle to the beginning
            const next = (parseInt(index) + DIRECTION[keyCode]) % tabs.length
            // Circle from beginning to end
            if (next === -1) {
              // focus the last item
              refs[tabs.length - 1].current.focus()
            }
            if (tabs[next]) {
              if (refs[next].current) {
                refs[next].current.focus()
              }
            }
          }
          break
        case KEYS.enter:
        case KEYS.space:
          // Activate current tab or tab with focus
          setActiveTab(index)
          break
      }
    },
    [setActiveTab, refs]
  )

  if (!tabs || !tabs.length) {
    return null
  }

  const renderTabs = tabs.map((tab, index) => {
    const isSelected = activeTab === index
    const addAriaProps = isSelected ? {} : { tabIndex: -1 }
    return (
      <StyledButton
        key={`button-${index}`}
        aria-controls={`panel-${index}`}
        aria-selected={isSelected}
        ref={refs[index]}
        id={`button-${index}`}
        isSelected={isSelected}
        onClick={handleClick(index)}
        onKeyDown={handleKeydown}
        onKeyUp={handleKeyup(index)}
        role="tab"
        {...addAriaProps}
      >
        {tab}
      </StyledButton>
    )
  })

  const renderPanels = panels.map((panel, index) => {
    const isVisible = activeTab === index
    // Only render visible panels for better performance
    const renderPanel = isVisible ? panel : null
    // Keep the wrapper in the DOM so the aria attributes between
    // button and panel are always linked
    return (
      <Panel
        key={`panel-${index}`}
        aria-hidden={!isVisible}
        aria-labelledby={`button-${index}`}
        id={`panel-${index}`}
        isVisible={isVisible}
        role="tabpanel"
        tabIndex={0}
      >
        {renderPanel}
      </Panel>
    )
  })

  return (
    <Wrapper>
      <TabList role="tablist" aria-label={label}>
        {renderTabs}
      </TabList>
      {renderPanels}
    </Wrapper>
  )
}

export default Tabs
