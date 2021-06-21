import React, { createContext, forwardRef, useContext } from 'react'
import type { ReactNode } from 'react'

import isPropValid from '@emotion/is-prop-valid'
import tw, { css, styled, theme } from 'twin.macro'
import { VariableSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

import { Button } from '../button/Button'
import { Icon } from '../icon/Icon'

/**
 * This Table component is based off of the ARIA Scrollable Data Grid example:
 * https://www.w3.org/TR/wai-aria-practices/examples/grid/dataGrids.html
 */

export interface TableColumn {
  Header: ReactNode
  accessor: string
  width?: number
  arrange?: 'fill' | 'none'
}

export type TableData = Record<string, ReactNode>[]
export interface TableProps {
  className?: string
  /**
   * Column headers to render. Header is the title of the column for the table. Accessor is the key on the data object.
   */
  columns: TableColumn[]
  /**
   * Rows to render
   */
  data: TableData
  /**
   * Row heights passed to the `itemSize` prop of [VariableSizeList](https://react-window.now.sh/#/examples/list/variable-size)
   */
  itemSize?: (index: number) => number
  /**
   * Show UI for controls. Since API is TBD, functionality is TBD
   */
  showControls?: boolean
}

// hsla(167, 100%, 5%, 0.92)

const ROW_HEIGHT = 45
const BORDER_COLOR = theme`colors.grey.3`

/* TODO: Table cells have the ability to be greedy with size or be restricted based on the content inside */
const StyledCell = styled('div', {
  // Do not pass 'width' prop to the DOM
  shouldForwardProp: (prop) => prop !== 'width' && isPropValid(prop),
})<{ arrange?: 'fill' | 'none'; width?: number }>`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex-direction: column;

  flex: 1 1 0;
  /* flex-basis: 0 will ignore the content of the cells and distribute all space */

  ${tw`py-3 px-6`}

  ${({ arrange, width }) => {
    if (width) {
      return css`
        padding: 0;
        max-width: ${width * 0.25}rem;
      `
    }
    if (arrange === 'fill') {
      return css`
        flex-grow: 4;
      `
    }
  }};

  &:not(:first-of-type) {
    box-shadow: inset 1px 0 0 ${BORDER_COLOR};
  }
`

const rowStyles = css`
  display: flex;
  width: 100%;
  box-shadow: inset 0 -1px 0 ${BORDER_COLOR};
`

const StyledRow = styled.div`
  ${rowStyles};
`

interface BaseRowProps {
  index: number
}

const StyledStickyRow = styled.div<BaseRowProps>`
  ${rowStyles};
  ${tw`w-full bg-green-tint text-green uppercase`}

  z-index: 2;
  position: sticky; /* sometimes the table peeks through at the top */
  top: ${(props) => props.index * ROW_HEIGHT}px;
  left: 0;

  ${StyledCell} {
    ${tw`bg-green-tint`}
  }
`

const ListContext = createContext<{ columns: TableColumn[] | null }>({
  columns: null,
})
ListContext.displayName = 'ListContext'

type StickyRowProps = BaseRowProps & Pick<TableProps, 'columns'>

const StickyRow = ({ index, columns, ...props }: StickyRowProps) => {
  return (
    <StyledStickyRow
      role="row"
      aria-rowindex={index + 1}
      index={index}
      {...props}
    >
      {columns.map((col, columnIndex) => {
        // role="columnheader" is the WAI-ARIA mapping for the <th> element
        return (
          <StyledCell
            key={`columnheader-${col.accessor}`}
            role="columnheader"
            aria-colindex={columnIndex + 1}
            width={col.width}
            arrange={col.arrange || 'none'}
          >
            {col.Header}
          </StyledCell>
        )
      })}
    </StyledStickyRow>
  )
}

interface RowProps extends BaseRowProps {
  row: Record<string, ReactNode>
  style?: React.CSSProperties
}

const Row = ({ index, row, style, ...props }: RowProps) => {
  const { columns } = useContext(ListContext)
  return (
    <StyledRow role="row" aria-rowindex={index + 1} style={style} {...props}>
      {columns?.map((col, columnIndex) => {
        const currentCol = col.accessor
        const currentCell = row[currentCol]
        // TODO: Keyboard focus should default to tabIndex='-1' and update to tabindex="0" when cell has focus
        // https://github.com/oxidecomputer/console/issues/66
        return (
          <StyledCell
            key={`gridcell-${col.accessor}-${columnIndex}`}
            role="gridcell"
            aria-colindex={columnIndex + 1}
            width={col.width}
            arrange={col.arrange || 'none'}
          >
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
    // role="rowgroup" is the WAI-ARIA mapping for the <tbody> element
    return (
      <div
        tw="flex flex-col flex-wrap flex-auto"
        role="rowgroup"
        ref={ref}
        {...props}
      >
        {columns?.length ? (
          <StickyRow key={0} index={0} columns={columns} />
        ) : null}
        {children}
      </div>
    )
  }
)

interface RowWrapperProps extends BaseRowProps {
  data: TableData
}

const RowWrapper = ({ data, index, ...props }: RowWrapperProps) => {
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
  return <Row index={index} row={row} {...props} />
}

export const Table = ({
  className,
  columns,
  data,
  itemSize = () => ROW_HEIGHT,
  showControls = false,
}: TableProps) => {
  if (!columns || !columns.length) {
    console.warn('Table: Missing `columns` prop')
    return null
  }
  if (!data || !data.length) {
    console.warn('Table: Missing `data` prop')
    return null
  }
  // Each row is absolutely positioned using a `top` offset
  // Make sure something takes up the 'space' of the first row
  const itemData = [{}, ...data]
  const count = itemData.length

  // TODO: Add keyboard controls
  // https://github.com/oxidecomputer/console/issues/66

  return (
    <div tw="height[inherit] flex flex-col">
      {showControls && (
        <div tw="flex justify-end">
          <Button tw="text-grey-1" variant="ghost">
            <Icon name="search" />
          </Button>
          <Button tw="text-grey-1" variant="ghost">
            <Icon name="filter" />
          </Button>
          <Button tw="text-grey-1" variant="ghost">
            <Icon name="viewCols" />
          </Button>
        </div>
      )}
      <div
        tw="h-full text-gray-50 text-sm"
        role="grid"
        aria-rowcount={count}
        className={className}
      >
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <ListContext.Provider value={{ columns: columns }}>
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
      </div>
    </div>
  )
}

export default Table
