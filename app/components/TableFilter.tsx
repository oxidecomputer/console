/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { CloseButton, Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import type { Column, ColumnFiltersState } from '@tanstack/react-table'
import cn from 'classnames'
import { isEqual } from 'lodash'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import {
  AddRoundel12Icon,
  Close12Icon,
  Filter12Icon,
} from '@oxide/design-system/icons/react'

import { defaultColumnFilters } from '~/table/QueryTable'
import { Button, buttonStyle } from '~/ui/lib/Button'
import { DateRangePicker } from '~/ui/lib/DateRangePicker'
import { Listbox } from '~/ui/lib/Listbox'
import { NumberInput } from '~/ui/lib/NumberInput'
import { TextInput } from '~/ui/lib/TextInput'
import { titleCase } from '~/util/str'
import { GiB, KiB, MiB, TiB } from '~/util/units'

export function TableFilter({
  disabled,
  columnFilters,
  setColumnFilters,
  localFilters,
  setLocalFilters,
  columnOptions,
}: {
  disabled: boolean
  localFilters: ColumnFiltersState
  setLocalFilters: Dispatch<SetStateAction<ColumnFiltersState>>
  columnFilters: ColumnFiltersState
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>
  columnOptions: Column<any, unknown>[]
}) {
  const [popoverElement, setPopoverElement] = useState<HTMLDivElement | null>()
  const setPopoverRef = (element: HTMLDivElement | null) => {
    setPopoverElement(element)
  }

  const addFilter = () => {
    setLocalFilters([
      ...localFilters,
      { id: columnOptions[0].columnDef.id || '', value: '' },
    ])
  }

  const updateFilter = (index: number, key: 'id' | 'value', value: string) => {
    const newFilters = [...localFilters]
    newFilters[index] = { ...newFilters[index], [key]: value }
    if (key === 'id') {
      newFilters[index].value = '' // We want to reset the value when the filter column changes
    }
    setLocalFilters(newFilters)
  }

  const deleteFilter = (index: number) => {
    const newFilters = localFilters.filter((_, i) => i !== index)
    if (newFilters.length > 0) {
      setLocalFilters(newFilters)
    } else {
      setLocalFilters([...defaultColumnFilters])
    }
  }

  const applyFilters = () => {
    // we don't want to include the empty filter awaiting input
    // in the actual columnFilter used against the table
    const trimmedLocalFilters = localFilters.filter((filter) => filter.id !== '')
    setColumnFilters(trimmedLocalFilters)
  }

  useEffect(() => {
    if (!popoverElement) {
      if (columnFilters.length > 0) {
        setLocalFilters(columnFilters)
      } else {
        setLocalFilters([...defaultColumnFilters])
      }
    }
  }, [columnFilters, popoverElement, setLocalFilters])

  const clearFilters = () => {
    setLocalFilters([...defaultColumnFilters])
    setColumnFilters([])
  }

  const isFiltering = columnFilters.length > 0
  const isDefault =
    isEqual(localFilters, defaultColumnFilters) && columnFilters.length === 0

  const hasChanges = !isEqual(localFilters, columnFilters) && !isDefault

  return (
    <Popover>
      <PopoverButton
        className={cn(
          buttonStyle({ size: 'sm', variant: 'ghost' }),
          'h-8 space-x-1',
          isFiltering ? '!px-2' : 'w-8',
          disabled && '!border-secondary [&>svg]:text-disabled'
        )}
        disabled={disabled}
      >
        <Filter12Icon
          aria-label="Links to docs"
          className={cn('shrink-0', isFiltering && 'text-accent')}
        />
        {isFiltering && (
          <div className="text-sans-sm text-tertiary">{columnFilters.length}</div>
        )}
      </PopoverButton>
      <PopoverPanel
        ref={setPopoverRef}
        modal
        // FiltersPopoverPanel needed for enter animation
        className="FiltersPopoverPanel z-10 w-[32rem] rounded-lg border bg-raise border-secondary elevation-1"
        anchor={{ to: 'bottom end', gap: 8 }}
      >
        <div className="flex justify-between border-b p-4 text-sans-md text-secondary bg-secondary border-secondary">
          Filter Snapshots
          <CloseButton
            onClick={clearFilters}
            className={cn(
              '-m-2 rounded p-2 transition-opacity text-sans-sm text-quaternary hover:bg-hover',
              !hasChanges ? 'pointer-events-none opacity-50' : ''
            )}
          >
            Clear
          </CloseButton>
        </div>
        <div>
          <div className="flex flex-col gap-2 px-4 py-3">
            {localFilters.map((filter, index) => {
              const columnOption = columnOptions.find((option) => option.id === filter.id)
              const availableOptions = columnOptions.filter(
                (col) => !localFilters.some((f) => f.id === col.id) || col.id === filter.id
              )
              const isRange = !!(
                columnOption && columnOption.columnDef.meta?.filterVariant === 'range'
              )
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex w-full items-center space-x-2">
                    <Listbox
                      selected={filter.id}
                      items={
                        availableOptions.map((col) => ({
                          value: col.id,
                          label: titleCase(
                            typeof col.columnDef.header === 'string'
                              ? col.columnDef.header
                              : col.id
                          ),
                        })) || []
                      }
                      onChange={(value) => updateFilter(index, 'id', value)}
                      className={cn(isRange ? 'w-1/3' : 'w-1/2', 'flex-shrink-0')}
                    />
                    <DynamicFilterInput
                      column={columnOption}
                      filterValue={filter.value}
                      onFilterChange={(value) => updateFilter(index, 'value', value)}
                    />
                  </div>
                  <button
                    className="-m-2 flex-shrink-0 rounded p-2 hover:bg-hover"
                    type="button"
                    onClick={() => deleteFilter(index)}
                  >
                    <Close12Icon className="flex-shrink-0" />
                  </button>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between border-t p-3 border-secondary">
            <Button variant="secondary" className="space-x-2" size="sm" onClick={addFilter}>
              <AddRoundel12Icon className="mr-2 text-quinary" />
              Add Filter
            </Button>

            <CloseButton
              as={Button}
              size="sm"
              onClick={applyFilters}
              disabled={!hasChanges}
              className={cn({ 'visually-disabled': !hasChanges })}
            >
              Apply
            </CloseButton>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  )
}

const DynamicFilterInput = ({
  column,
  filterValue,
  onFilterChange,
}: {
  column: Column<any, unknown> | undefined
  filterValue: string | number[]
  onFilterChange: (value: string | number[]) => void
}) => {
  if (!column) {
    return (
      <TextInput
        value={''}
        className="w-1/2 rounded border shadow"
        disabled
        placeholder="Filter value"
      />
    )
  }

  const { filterVariant, options } = column.columnDef.meta ?? {}

  if (filterVariant === 'range') {
    return <FilterNumberRange filterValue={filterValue} onChange={onFilterChange} />
  } else if (filterVariant === 'select' && options) {
    return (
      <Listbox
        selected={filterValue?.toString()}
        items={options.map((val) => ({ value: val, label: titleCase(val) }))}
        onChange={(val) => onFilterChange(val)}
        className="w-1/2"
      />
    )
  } else if (filterVariant === 'datetime') {
    return (
      <DateRangePicker // close on select
        value={filterValue}
        onChange={(range) => {
          onFilterChange(range)
        }}
        label="Label"
        hideTimeZone
        hourCycle={24}
        disableTime
        className="w-1/2 bg-default"
      />
    )
  } else {
    return (
      <TextInput
        value={filterValue.toString() ?? ''}
        onChange={(e) => onFilterChange(e.target.value)}
        className="w-1/2 rounded border shadow"
        placeholder="Filter value"
      />
    )
  }
}

const units = [
  { label: 'KiB', value: KiB },
  { label: 'MiB', value: MiB },
  { label: 'TiB', value: TiB },
  { label: 'GiB', value: GiB },
]

const FilterNumberRange = ({
  filterValue,
  onChange,
}: {
  filterValue: string | number[]
  onChange: (value: string | number[]) => void
}) => {
  const [unit, setUnit] = useState(MiB.toString())
  const numberUnit = parseInt(unit)

  let min = undefined
  let max = undefined
  if (Array.isArray(filterValue) && filterValue.length === 2) {
    min = typeof filterValue[0] === 'number' ? filterValue[0] / numberUnit : undefined
    max = typeof filterValue[1] === 'number' ? filterValue[1] / numberUnit : undefined
  }

  console.log(filterValue)

  return (
    <div className="flex w-2/3 space-x-2">
      <Listbox
        selected={unit}
        items={units.map((unit) => ({ label: unit.label, value: unit.value.toString() }))}
        onChange={(val) => {
          setUnit(val)
        }}
        className="w-1/3"
      />
      <NumberInput
        value={min}
        onChange={(value) => onChange([value * numberUnit, max ?? NaN])}
        className="w-1/3"
        placeholder="Min"
        formatOptions={{
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }}
      />
      <NumberInput
        value={max}
        onChange={(value) => onChange([min ?? NaN, value * numberUnit])}
        className="w-1/3"
        placeholder="Max"
        formatOptions={{
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }}
      />
    </div>
  )
}
