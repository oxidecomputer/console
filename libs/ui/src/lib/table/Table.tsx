import React, { forwardRef } from 'react'

import styled, { css } from 'styled-components'
import { VariableSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

/* eslint-disable-next-line */
export interface TableProps {}

const STICKY_INDICES = [0, 1]
const ROW_HEIGHT = 35

const Wrapper = styled.div`
  height: 100%;

  background-color: hsla(167, 100%, 5%, 0.92);
  color: ${(props) => props.theme.color('gray100')};
  font-size: ${(props) => props.theme.spacing(3.5)};
  font-weight: 400;
`

const StyledRowGroup = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  flex: 1 1 auto;
`

const rowStyles = css`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  width: 100%;

  box-shadow: inset 0px -1px 0px rgba(198, 209, 221, 0.5);
`

const StyledRow = styled.div`
  ${rowStyles};
`

const StyledStickyRow = styled.div<{ index: number }>`
  ${rowStyles};

  position: sticky;
  top: ${(props) => props.index * 35}px;
  left: 0;

  width: 100%;
  height: ${ROW_HEIGHT}px;

  text-transform: uppercase;
`

const StyledCell = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  flex: 1 1 0;
`

const Row = ({ index, style }) => (
  <StyledRow role="row" aria-rowindex={index + 1} style={style}>
    <StyledCell role="gridcell">Row {index}</StyledCell>
    <StyledCell role="gridcell">Row {index}</StyledCell>
    <StyledCell role="gridcell">Row {index}</StyledCell>
  </StyledRow>
)

const StickyRow = ({ index }) => (
  <StyledStickyRow role="row" aria-rowindex={index + 1} index={index}>
    <StyledCell role="columnheader">Sticky Row {index}</StyledCell>
    <StyledCell role="columnheader">Sticky Row {index}</StyledCell>
    <StyledCell role="columnheader">Sticky Row {index}</StyledCell>
  </StyledStickyRow>
)

const RowGroup = forwardRef((props: any, ref: React.Ref<HTMLDivElement>) => {
  return (
    <StyledRowGroup role="rowgroup" ref={ref} {...props}>
      {STICKY_INDICES.map((index) => (
        <StickyRow index={index} key={index} />
      ))}
      {props.children}
    </StyledRowGroup>
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
          <VariableSizeList
            innerElementType={RowGroup}
            height={height}
            itemCount={count}
            itemData={{ ItemRenderer: Row, stickyIndices: STICKY_INDICES }}
            itemSize={(index) => ROW_HEIGHT}
            width={width}
          >
            {ItemWrapper}
          </VariableSizeList>
        )}
      </AutoSizer>
    </Wrapper>
  )
}

export default Table
