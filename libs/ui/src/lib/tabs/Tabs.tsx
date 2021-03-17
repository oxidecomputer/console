import React, {
  FC,
  useState,
  useCallback,
  useEffect,
  useRef,
  createRef,
} from 'react'

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
  37: -1, // retreat
  38: -1,
  39: 1, // advance
  40: 1,
}

export const Tabs: FC<TabsProps> = ({ label, tabs, panels }) => {
  const [tabRefs, setTabRefs] = useState([])
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    // update refs
    const refs = new Array(tabs.length)
      .fill('')
      .map((item, index) => tabRefs[index] || createRef())
    console.log('useEffect', refs)
    setTabRefs(refs)
  }, tabs)

  const handleClick = useCallback(
    (event) => {
      const nextTabIndex = event.target.id
      setActiveTab(parseInt(nextTabIndex))
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
          setActiveTab(tabs.length)
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
    (event) => {
      const { keyCode } = event

      switch (keyCode) {
        case KEYS.left:
        case KEYS.right:
          event.preventDefault()
          // Either focus the next, previous, first, or last tab, depending on key pressed
          if (DIRECTION[keyCode]) {
            const {
              target: { id },
            } = event
            // Modulus allows the end to circle to the beginning
            const next = (parseInt(id) + DIRECTION[keyCode]) % tabs.length
            // Circle from beginning to end
            if (next === -1) {
              // focus the last item
              tabRefs[tabs.length - 1].current.focus()
            }
            if (tabs[next]) {
              // this ref is a Component instance, not the DOM element
              // Move focus but do not select it until enter is pressed
              if (tabRefs[next].current) {
                tabRefs[next].current.focus()
              }
            }
          }
          break
        case KEYS.delete:
          console.log('TODO: determine deletable')
          break
        case KEYS.enter:
        case KEYS.space:
          // Activate current tab
          handleClick(event)
          break
      }
    },
    [handleClick, tabRefs]
  )

  if (!tabs || !tabs.length) {
    return null
  }

  const renderTabs = tabs.map((tab, index) => {
    // TODO: what happens if there are multiple Tabs components? Use a better id??
    const tabIndex = index
    const isSelected = activeTab === tabIndex
    const addAriaProps = isSelected ? {} : { tabIndex: -1 }
    return (
      <StyledButton
        key={`tab-button-${index}`}
        aria-controls={`panel-${tabIndex}`}
        aria-selected={isSelected}
        ref={tabRefs[index]}
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
    const tabIndex = index
    const panelIndex = `panel-${tabIndex}`
    const isVisible = activeTab === tabIndex
    return (
      <Panel
        key={`tab-panel-${index}`}
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
