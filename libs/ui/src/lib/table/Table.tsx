import React, { forwardRef } from 'react'

import styled from 'styled-components'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

/* eslint-disable-next-line */
export interface TableProps {}

const STICKY_INDICES = [0, 1]

const Wrapper = styled.div`
  height: 100%;
`

const StyledRow = styled.div`
  display: table-row;
`

const StyledStickyRow = styled.div<{ index: number }>`
  display: table-row;
  position: sticky;
  top: ${(props) => props.index * 35}px;
  left: 0;

  width: 100%;
  height: 35px;

  border: 1px solid blue;
`

const StyledCell = styled.div`
  display: table-cell;
  border: 1px solid red;
`

const Row = ({ index, style }) => (
  <StyledRow role="row" aria-rowindex={index + 1} style={style}>
    <StyledCell role="gridcell">Row {index}</StyledCell>
  </StyledRow>
)

const StickyRow = ({ index }) => (
  <StyledStickyRow role="row" aria-rowindex={index + 1} index={index}>
    <StyledCell role="columnheader">Row {index}</StyledCell>
  </StyledStickyRow>
)

const RowGroup = forwardRef((props: any, ref: React.Ref<HTMLDivElement>) => {
  return (
    <div role="rowgroup" ref={ref} {...props}>
      {STICKY_INDICES.map((index) => (
        <StickyRow index={index} key={index} />
      ))}
      {props.children}
    </div>
  )
})

const ItemWrapper = ({ data, index, style }) => {
  const { ItemRenderer, stickyIndices } = data
  if (stickyIndices && stickyIndices.includes(index)) {
    return null
  }
  return <ItemRenderer index={index} style={style} />
}

export const Table = (props: TableProps) => {
  const count = 1000
  return (
    <Wrapper role="grid" aria-rowcount={count}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            innerElementType={RowGroup}
            height={height}
            itemCount={count}
            itemData={{ ItemRenderer: Row, stickyIndices: STICKY_INDICES }}
            itemSize={35}
            width={width}
          >
            {ItemWrapper}
          </FixedSizeList>
        )}
      </AutoSizer>
    </Wrapper>
  )
}

export default Table
