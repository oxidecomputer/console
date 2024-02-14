/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useDrag } from '@use-gesture/react'
import cn from 'classnames'
import { useRef, useState } from 'react'

import { Button, More12Icon, NextArrow12Icon, PrevArrow12Icon } from '@oxide/ui'

import { useMonitoring } from 'app/pages/system/monitoring/ExplorerPage'

import { sensors, temperatureRanges, type Sensor } from './data'

const ExplorerTimeline = () => {
  const { selectedComponent, selectedTime, setSelectedTime, sensorDataArray } =
    useMonitoring()

  const [hovered, setHovered] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseOver = (event: React.MouseEvent) => {
    if (!containerRef.current) {
      setHovered(null)
      return
    }

    setHovered(getSliceIndex(event))
  }

  const getSliceIndex = (event: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) {
      return null
    }

    const { left } = containerRef.current.getBoundingClientRect()
    const relativeX = (event as MouseEvent).clientX - left + 3
    return Math.max(0, Math.floor(relativeX / (8 + 3)))
  }

  const bind = useDrag(
    ({ event }) => {
      if (!containerRef.current) {
        setHovered(null)
        return
      }

      const index = getSliceIndex(event as MouseEvent)

      setHovered(index)
      setSelectedTime(index)
    },
    { pointer: { keys: false } }
  )

  const sensor = sensors.find((s) => s.label === selectedComponent)

  return (
    <div className="flex select-none flex-col overflow-hidden border-t border-t-secondary">
      <div className="item-center flex justify-between border-b px-4 py-3 border-b-secondary">
        <div className="flex gap-2">
          <Button size="sm" className="px-2 py-1 opacity-60" variant="ghost">
            Month
          </Button>
          <Button size="sm" className="px-2 py-1 opacity-60" variant="ghost">
            Week
          </Button>
          <Button size="sm" className="px-2 py-1" variant="secondary">
            Hour
          </Button>
          <Button size="sm" className="px-2 py-1 opacity-60" variant="ghost">
            Minute
          </Button>
          <Button size="sm" className="px-2 py-1 opacity-60" variant="ghost">
            Custom
          </Button>
        </div>
        <Button size="sm" className="!w-[32px] text-secondary" variant="ghost">
          <More12Icon />
        </Button>
      </div>
      <div className="flex h-full items-center gap-2 overflow-hidden px-4 pb-4 pt-6">
        <button className="-mx-1 mb-[32px] h-full rounded px-1 hover:bg-hover" disabled>
          <PrevArrow12Icon className="flex-shrink-0 text-disabled" />
        </button>
        <div className="relative flex h-full flex-col  justify-between pb-[32px] text-mono-xs text-quaternary">
          <div className="absolute bottom-[32px] left-0 top-0 border-l border-l-secondary" />
          <div className="flex flex-grow items-start gap-1">
            <div className="w-3 border-b border-default" />
            <div className="-translate-y-1/2">100</div>
          </div>
          <div className="flex flex-grow items-center gap-1">
            <div className="w-3 border-b border-default" />
            <div>50</div>
          </div>
          <div className="flex flex-grow items-end gap-1">
            <div className="w-3 border-b border-default" />
            <div className="translate-y-1/2">0</div>
          </div>
        </div>
        <div
          tabIndex={0}
          role="button"
          className="flex h-full max-w-[calc(100%-4rem)] cursor-pointer touch-none items-center gap-2 !outline-none"
          ref={containerRef}
          {...bind()}
          onMouseOver={handleMouseOver}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => {}}
          onClick={() => setSelectedTime(hovered)}
          onKeyDown={(evt) => {
            if ((evt.key === 'ArrowLeft' || evt.key === 'ArrowRight') && selectedTime) {
              const adjustment = evt.key === 'ArrowRight' ? 1 : -1
              setSelectedTime(selectedTime + adjustment)
            }
          }}
        >
          <div className="relative h-full w-full overflow-hidden">
            <div className="flex h-full flex-col">
              <div className="flex h-full w-full gap-[3px] pb-[38px]">
                {sensorDataArray.map((sensorValues, i) => (
                  <SensorTimelineBar
                    key={i}
                    time={i}
                    isHovered={hovered === i}
                    value={selectedComponent ? sensorValues[selectedComponent] : 100}
                    sensorType={sensor ? sensor.type : undefined}
                  />
                ))}
              </div>
              <div className="absolute bottom-0 mt-[6px] h-[32px] w-full border-t border-default">
                {Array.from({ length: 300 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ left: i * 100 + 50 }}
                    className="absolute flex flex-col items-center gap-0.5 text-mono-xs text-quaternary"
                  >
                    <div className="h-[6px] w-[1px] border-l border-default" />
                    <div className="leading-[1.15]">
                      09/29
                      <br />
                      12:00
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-12"
              style={{
                background: 'linear-gradient(90deg, rgba(8, 15, 17, 0) 0%, #080F11 100%)',
              }}
            />
          </div>
          <button className="-mx-1  mb-[32px] h-full rounded px-1 hover:bg-hover">
            <NextArrow12Icon className="flex-shrink-0 text-secondary" />
          </button>
        </div>
      </div>
    </div>
  )
}

const SensorTimelineBar = ({
  time,
  isHovered,
  value,
  sensorType,
}: {
  time: number
  isHovered: boolean
  value: number
  sensorType: Sensor['type'] | undefined
}) => {
  const { selectedComponent, selectedTime } = useMonitoring()
  let state = 'normal'
  if (sensorType && value > temperatureRanges[sensorType][2]) {
    state = 'urgent'
  } else if (sensorType && value > temperatureRanges[sensorType][1]) {
    state = 'notice'
  }

  return (
    <div className="relative flex h-full w-[8px] flex-shrink-0">
      <div className="group flex h-full w-full items-end">
        <div
          className={cn(
            'w-full rounded-sm border border-[rgba(255,255,255,0.1)] bg-[var(--base-neutral-300)] ease-[cubic-bezier(0,0,0.2,1)]  [transition:background-color_250ms,height_350ms]',
            state === 'normal' && selectedComponent && 'bg-[var(--base-neutral-500)]',
            state === 'notice' && 'bg-[var(--base-yellow-500)]',
            state === 'urgent' && 'bg-[var(--base-red-500)]',
            !isHovered && 'opacity-80'
          )}
          style={{
            height: `${value}%`,
          }}
        />
      </div>
      {time === selectedTime && (
        <div className="absolute flex h-full w-[8px] flex-col items-center gap-1">
          <div className="h-full w-[1px] bg-[var(--content-accent)]" />
        </div>
      )}
    </div>
  )
}

export default ExplorerTimeline
