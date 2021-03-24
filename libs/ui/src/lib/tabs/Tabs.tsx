import type { KeyboardEvent, FC, RefObject, EventHandler } from 'react'
import React, { useState, useEffect, createRef } from 'react'

import styled, { css } from 'styled-components'

import { Button } from '../button/Button'
import { KEYS } from '../keys-utils'

export interface TabsProps {
  /**
   * Should tab buttons take up the full width of the container
   */
  fullWidth?: boolean
  /**
   * A short description for the Tabs. It gets passed to `aria-label`
   */
  label: string
  /**
   * An array of each tab name
   */
  tabs: string[]
  /**
   * Panel to render for corresponding active tab.
   */
  children: Array<React.ReactNode>
}

const Wrapper = styled.div``

const TabList = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`

const StyledButton = styled(Button).attrs({
  size: 'base',
  variant: 'ghost',
})<{ fullWidth: boolean; isSelected: boolean }>`
  ${({ isSelected, theme }) =>
    isSelected
      ? css`
          color: ${theme.color('green500')};
        `
      : css`
          color: ${theme.color('green50')};
        `}

  ${({ fullWidth }) => (fullWidth ? `flex: 1;` : null)}
  border-bottom: 1px solid currentColor;

  &:hover {
    color: ${({ theme }) => theme.color('green500')};
  }
`

const Panel = styled.div<{ isVisible: boolean }>`
  margin-top: ${({ theme }) => theme.spacing(4)};

  ${({ isVisible }) => (isVisible ? null : `display: none;`)};
`

// Add or subtract depending on key pressed
const DIRECTION = {
  [KEYS.left]: -1, // retreat
  [KEYS.right]: 1, // advance
}

export const Tabs: FC<TabsProps> = ({
  fullWidth = false,
  label,
  tabs,
  children,
}) => {
  const [refs, setRefs] = useState<RefObject<HTMLButtonElement>[]>([])
  const [activeTab, setActiveTab] = useState(0)
  const [focusTab, setFocusTab] = useState<number | null>(null)

  useEffect(() => {
    // create refs for all the tabs
    const initialize = new Array(tabs.length)
      .fill('')
      .map(() => createRef<HTMLButtonElement>())
    setRefs(initialize)
  }, [tabs])

  useEffect(() => {
    if (focusTab === null) return

    const ref = refs[focusTab]
    if (ref && ref.current) {
      ref.current.focus()
    }
  }, [refs, focusTab])

  const handleClick = (index: number) => () => {
    setActiveTab(index)
  }

  const handleKeydown: EventHandler<KeyboardEvent<HTMLButtonElement>> = (
    event
  ) => {
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
  }

  const handleKeyup = (
    index: number
  ): EventHandler<KeyboardEvent<HTMLButtonElement>> => (event) => {
    const { keyCode } = event

    switch (keyCode) {
      case KEYS.left:
      case KEYS.right:
        event.preventDefault()
        // Either focus the next, previous, first, or last tab, depending on key pressed
        if (DIRECTION[keyCode]) {
          // Modulus allows the end to circle to the beginning
          const next = (index + DIRECTION[keyCode]) % tabs.length
          // Circle from beginning to end
          if (next === -1) {
            // focus the last item
            setFocusTab(tabs.length - 1)
          } else {
            setFocusTab(next)
          }
        }
        break
      case KEYS.enter:
      case KEYS.space:
        // Activate current tab or tab with focus
        setActiveTab(index)
        break
    }
  }

  if (!tabs || !tabs.length) {
    return null
  }

  const renderTabs = tabs.map((tab, index) => {
    const isSelected = activeTab === index
    const addAriaProps = isSelected ? {} : { tabIndex: -1 }
    return (
      <StyledButton
        aria-controls={`panel-${index}`}
        aria-selected={isSelected}
        fullWidth={fullWidth}
        id={`button-${index}`}
        isSelected={isSelected}
        key={`button-${index}`}
        onClick={handleClick(index)}
        onKeyDown={handleKeydown}
        onKeyUp={handleKeyup(index)}
        ref={refs[index]}
        role="tab"
        {...addAriaProps}
      >
        {tab}
      </StyledButton>
    )
  })

  const renderPanels = React.Children.map(children, (panel, index) => {
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
      <TabList
        role="tablist"
        aria-label={label}
        onBlur={() => {
          setFocusTab(null)
        }}
      >
        {renderTabs}
      </TabList>
      {renderPanels}
    </Wrapper>
  )
}

export default Tabs
