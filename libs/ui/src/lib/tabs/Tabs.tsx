import React, { FC, useState, useCallback } from 'react'

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
  37: -1, // left
  38: -1,
  39: 1, // right
  40: 1,
}

export const Tabs: FC<TabsProps> = ({ label, tabs, panels }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(1)
  const handleClick = useCallback(
    (event) => {
      const nextTabIndex = event.target.id
      setCurrentTabIndex(parseInt(nextTabIndex))
    },
    [setCurrentTabIndex]
  )

  // Either focus the next, previous, first, or last tab, depending on key pressed
  const setCurrentTabOnKeyPress = (event) => {
    const key = event.keyCode

    if (DIRECTION[key]) {
      console.log('existing in DIRECTION', DIRECTION[key])
      const { target } = event
      console.log('target', target)
    }
  }

  const handleKeydown = useCallback(
    (event) => {
      const { keyCode } = event
      switch (keyCode) {
        case KEYS.end:
          event.preventDefault()
          // Activate last tab
          console.log('TODO: activate last tab')
          setCurrentTabIndex(tabs.length)
          break
        case KEYS.home:
          event.preventDefault()
          // Activiate first tab
          console.log('TODO: activate first tab')
          setCurrentTabIndex(1)
          break
        case KEYS.up:
        case KEYS.down:
          // Up and down are in keydown
          // because we need to prevent page scroll
          // Do nothing
          break
      }
    },
    [setCurrentTabIndex, tabs]
  )

  const handleKeyup = useCallback(
    (event) => {
      const { keyCode } = event

      switch (keyCode) {
        case KEYS.left:
        case KEYS.right:
          event.preventDefault()
          setCurrentTabOnKeyPress(event)
          break
        case KEYS.delete:
          console.log('TODO: determine deletable')
          break
        case KEYS.enter:
        case KEYS.space:
          // Set current tab
          handleClick(event)
          break
      }
    },
    [handleClick]
  )

  if (!tabs || !tabs.length) {
    return null
  }

  const renderTabs = tabs.map((tab, index) => {
    // TODO: what happens if there are multiple Tabs components? Use a better id??
    const tabIndex = index + 1
    const isSelected = currentTabIndex === tabIndex
    const addAriaProps = isSelected ? {} : { tabIndex: -1 }
    return (
      <StyledButton
        aria-controls={`panel-${tabIndex}`}
        aria-selected={isSelected}
        id={`${tabIndex}`}
        isSelected={isSelected}
        onClick={handleClick}
        onKeyDown={handleKeydown}
        onKeyUp={handleKeyup}
        role="tab"
        {...addAriaProps}
      >
        {tab}
      </StyledButton>
    )
  })

  const renderPanels = panels.map((panel, index) => {
    const tabIndex = index + 1
    const panelIndex = `panel-${tabIndex}`
    const isVisible = currentTabIndex === tabIndex
    return (
      <Panel
        aria-hidden={!isVisible}
        aria-labelledby={`${tabIndex}`}
        id={panelIndex}
        isVisible={isVisible}
        role="tabpanel"
        tabIndex={0}
      >
        {panel}
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
