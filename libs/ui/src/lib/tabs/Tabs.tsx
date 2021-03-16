import React, { FC, useState, useCallback } from 'react'

import styled, { css } from 'styled-components'

import { Button } from '../button/Button'

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
`

const Panel = styled.div<{ isVisible: boolean }>`
  ${({ isVisible }) =>
    isVisible
      ? null
      : css`
          display: none;
        `}
`

export const Tabs: FC<TabsProps> = ({ label, tabs, panels }) => {
  const [currentTabIndex, setCurrentTabIndex] = useState(1)
  const handleClick = useCallback(
    (ev) => {
      const nextTabIndex = ev.target.id
      setCurrentTabIndex(parseInt(nextTabIndex))
    },
    [setCurrentTabIndex]
  )

  if (!tabs || !tabs.length) {
    return null
  }

  const renderTabs = tabs.map((tab, index) => {
    // TODO: what happens if there are multiple Tabs components? Use a better id??
    const tabIndex = index + 1
    const isSelected = currentTabIndex === tabIndex
    return (
      <StyledButton
        aria-controls={`tabpanel-${tabIndex}`}
        aria-selected={isSelected}
        id={`${tabIndex}`}
        isSelected={isSelected}
        onClick={handleClick}
        role="tab"
      >
        {tab}
      </StyledButton>
    )
  })

  const renderPanels = panels.map((panel, index) => {
    const tabIndex = index + 1
    const panelIndex = `"panel"-${tabIndex}`
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
