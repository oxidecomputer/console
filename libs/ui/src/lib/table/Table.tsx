import React, { createContext, forwardRef, useContext } from 'react'

import styled, { css } from 'styled-components'
import { VariableSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

/**
 * This Table component is based off of the ARIA Scrollable Data Grid example:
 * https://www.w3.org/TR/wai-aria-practices/examples/grid/dataGrids.html
 */

export interface TableProps {
  /**
   * Column headers to render. Header is the title of the column for the table. Accessor is the key on the data object.
   */
  columns: Array<{ Header: string | React.ReactNode; accessor: string }>
  /**
   * Rows to render
   */
  data: Array<Record<string, unknown>>
  /**
   * Row heights passed to the `itemSize` prop of [VariableSizeList](https://react-window.now.sh/#/examples/list/variable-size)
   */
  itemSize: (index: number) => number
}

const ROW_HEIGHT = 45
const DARK_GREEN = `hsla(167, 100%, 5%, 1)`
const BORDER_COLOR = `hsla(209, 25%, 82%, 0.5)`

const Wrapper = styled.div`
  height: 100%;

  background-color: ${DARK_GREEN};
  color: ${({ theme }) => theme.color('gray50')};
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: ${({ theme }) => theme.spacing(3.5)};
  font-weight: 400;
  line-height: ${1.25 / 0.875}; /* 1.25rem */
`

const StyledRowGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  flex: 1 1 auto;
`

const StyledCell = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex-wrap: nowrap;
  flex: 1 1 0;

  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(6)};

  &:not(:first-child) {
    box-shadow: inset 1px 0 0 ${BORDER_COLOR};
  }
`

const rowStyles = css`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  width: 100%;

  box-shadow: inset 0 -1px 0 ${BORDER_COLOR};
`

const StyledRow = styled.div`
  ${rowStyles};
`

const StyledStickyRow = styled.div<{ index: number }>`
  ${rowStyles};

  z-index: 2;
  position: sticky; /* sometimes the table peeks through at the top */
  top: ${(props) => props.index * ROW_HEIGHT}px;
  left: 0;

  width: 100%;

  background-color: ${DARK_GREEN};
  color: ${({ theme }) => theme.color('green500')};
  text-transform: uppercase;

  ${StyledCell} {
    background-color: ${({ theme }) => theme.color('green500', 0.16)};
  }
`

const ListContext = createContext({ columns: null })
ListContext.displayName = 'ListContext'

const StickyRow = ({ index, columns, ...props }) => {
  return (
    <StyledStickyRow
      role="row"
      aria-rowindex={index + 1}
      index={index}
      {...props}
    >
      {columns.map((col, columnIndex) => {
        return (
          <StyledCell
            key={`columnheader-${col.accessor}`}
            role="columnheader"
            aria-colindex={columnIndex + 1}
          >
            {col.Header}
          </StyledCell>
        )
      })}
    </StyledStickyRow>
  )
}

const Row = ({ index, row, style, ...props }) => {
  const { columns } = useContext(ListContext)
  return (
    <StyledRow role="row" aria-rowindex={index + 1} style={style} {...props}>
      {columns.map((col, columnIndex) => {
        const currentCol = col.accessor
        const currentCell = row[currentCol]
        // TODO: Keyboard focus should default to tabIndex='-1' and update to tabindex="0" when cell has focus
        // https://github.com/oxidecomputer/console/issues/66
        return (
          <StyledCell role="gridcell" aria-colindex={columnIndex + 1}>
            {currentCell}
          </StyledCell>
        )
      })}
    </StyledRow>
  )
}

const InnerWrapper = forwardRef(
  ({ children, ...props }, ref: React.Ref<HTMLDivElement>) => {
    const { columns } = useContext(ListContext)
    // role="rowgroup" is equivalent WAI-ARIA mapping for the <tbody> element
    return (
      <StyledRowGroup role="rowgroup" ref={ref} {...props}>
        {columns && columns.length ? (
          <StickyRow key={0} index={0} columns={columns} />
        ) : null}
        {children}
      </StyledRowGroup>
    )
  }
)

const RowWrapper = ({ data, index, style, ...props }) => {
  // react-window will only render & mount the rows that are visible in the viewport
  // (so this component is not guaranteed to always have access to `data[0]`)
  const isStickyHeader = index === 0
  if (isStickyHeader) {
    // Skip rendering the first row that displays the column headings, because
    // `InnerWrapper` will always render it as a sticky row
    return null
  }
  // Pass row data to each visible row
  const row = data[index]
  return <Row index={index} style={style} row={row} {...props} />
}

export const Table = ({ columns, data, itemSize }: TableProps) => {
  if (!columns || !columns.length) {
    console.warn('Table: Missing `columns` prop')
    return null
  }
  if (!data || !data.length) {
    console.warn('Table: Missing `data` prop')
    return null
  }
  const count = data.length
  // Each row is absolutely positioned using a `top` offset
  // Make sure something takes up the 'space' of the first row
  const itemData = [[], ...data]

  // TODO: Add keyboard controls
  // https://github.com/oxidecomputer/console/issues/66

  return (
    <Wrapper role="grid" aria-rowcount={count}>
      <AutoSizer>
        {({ height, width }) => (
          <ListContext.Provider
            value={{
              columns: columns,
            }}
          >
            <VariableSizeList
              innerElementType={InnerWrapper}
              height={height}
              itemCount={count}
              itemData={itemData}
              itemSize={itemSize}
              width={width}
            >
              {RowWrapper}
            </VariableSizeList>
          </ListContext.Provider>
        )}
      </AutoSizer>
    </Wrapper>
  )
}

Table.defaultProps = {
  itemSize: () => ROW_HEIGHT,
}

export default Table
