/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import cn from 'classnames'
import fuzzysort from 'fuzzysort'
import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'

import { sensors, type SensorValues } from 'app/components/monitoring/data'

import './monitoring.css'

import { createContext, useContext, useState } from 'react'
import type { OrthographicCamera } from 'three'

import {
  Add12Icon,
  Button,
  Close8Icon,
  EmptyMessage,
  Filter12Icon,
  Logs16Icon,
  NextArrow12Icon,
  PrevArrow12Icon,
  Search16Icon,
  Tabs,
  Warning12Icon,
} from '@oxide/ui'
import { titleCase } from '@oxide/util'

import {
  generateMockSensorData,
  generateSensorValuesArray,
  temperatureRanges,
} from 'app/components/monitoring/data'
import ExplorerTimeline from 'app/components/monitoring/ExplorerTimeline'
import { Minus12Icon } from 'app/components/monitoring/Icons'
import SingleSled from 'app/components/monitoring/SingleSled'

const mockData = generateMockSensorData()
const sensorDataArray = generateSensorValuesArray(mockData)

type MonitoringContextType = {
  selectedTime: number | null
  setSelectedTime: (value: number | null) => void
  selectedComponent: string | null
  setSelectedComponent: (value: string | null) => void
  sensorDataArray: SensorValues[]
}

const defaultState: MonitoringContextType = {
  selectedTime: 20,
  setSelectedTime: () => {},
  selectedComponent: null,
  setSelectedComponent: () => {},
  sensorDataArray: [],
}

const MonitoringContext = createContext<MonitoringContextType>(defaultState)

export const useMonitoring = () => useContext(MonitoringContext)

export function ExplorerPage() {
  const [selectedTime, setSelectedTime] = useState<number | null>(20)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  const cameraRef = useRef<OrthographicCamera>(null)

  const data = sensorDataArray[selectedTime || 0]

  const handleBack = () => {
    if (selectedComponent) {
      setSelectedComponent(null)
    }
  }

  const [zoom, setZoom] = useState(1000)

  const handleZoomIn = () => {
    if (zoom < 2000 && cameraRef.current) {
      const roundedZoom = Math.floor(cameraRef.current.zoom / 500) * 500
      cameraRef.current.zoom = roundedZoom + 500
      setZoom(cameraRef.current.zoom)
    }
  }

  const handleZoomOut = () => {
    if (zoom > 500 && cameraRef.current) {
      const roundedZoom = Math.ceil(cameraRef.current.zoom / 500) * 500
      cameraRef.current.zoom = roundedZoom - 500
      setZoom(cameraRef.current.zoom)
    }
  }

  const { sled } = useParams()
  return (
    <MonitoringContext.Provider
      value={{
        selectedTime,
        setSelectedTime,
        selectedComponent,
        setSelectedComponent,
        sensorDataArray,
      }}
    >
      <div className="grid h-full max-h-[calc(100vh-60px)] grid-cols-[1fr,14.25rem]">
        <div className="grid grid-rows-[1fr,12.75rem]">
          <div className="relative max-h-[calc(100vh-60px-204px)] bg-raise">
            <SingleSled setZoom={setZoom} cameraRef={cameraRef} sensorData={data} />
            <div className="absolute left-4 top-4 flex gap-2">
              <Button size="sm" variant="secondary" className="w-8" onClick={handleBack}>
                <PrevArrow12Icon />
              </Button>
              {sled && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedComponent(null)}
                >
                  Sled {sled}
                </Button>
              )}
              {selectedComponent && (
                <Button size="sm" variant="secondary" className="pointer-events-none">
                  {selectedComponent}
                </Button>
              )}
            </div>

            <div className="absolute bottom-4 left-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="w-8"
                onClick={handleZoomIn}
                disabled={zoom >= 2000}
              >
                <Add12Icon />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8"
                onClick={handleZoomOut}
                disabled={zoom <= 500}
              >
                <Minus12Icon />
              </Button>
            </div>
          </div>
          <ExplorerTimeline />
        </div>
        <ExplorerSidebar sensorData={data} />
      </div>
    </MonitoringContext.Provider>
  )
}

const ExplorerSidebar = ({ sensorData }: { sensorData: SensorValues }) => {
  const [filterInput, setFilterInput] = useState('')
  const { selectedComponent } = useMonitoring()

  const allSensors = Object.entries(sensorData).map(([label, value]) => {
    const sensor = sensors.find((s) => s.label === label)
    return {
      label,
      value,
      showWarning: sensor ? value > temperatureRanges[sensor.type][1] : false,
      showUrgent: sensor ? value > temperatureRanges[sensor.type][2] : false,
    }
  })

  const results = fuzzysort.go(filterInput, allSensors, { key: 'label' })

  return (
    <div className="overflow-hidden border-l border-l-secondary">
      <Tabs.Root defaultValue="values" className="pane flex flex-col">
        <Tabs.List className="z-10 pt-2 !bg-default">
          <Tabs.Trigger value="values">Values</Tabs.Trigger>
          <Tabs.Trigger value="options">Options</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="values"
          className="flex max-h-[calc(100vh-108px)] flex-shrink flex-grow flex-col"
        >
          <div className="z-10 border-b p-4 bg-default border-secondary">
            <div className="relative flex items-center gap-2 rounded border p-2 text-sans-md border-default ring-accent-secondary focus-within:ring-2">
              <Search16Icon className="absolute left-2 h-3 w-3 text-quinary" />
              <input
                type="text"
                placeholder="Filter components"
                className="border-none bg-transparent p-0 pl-5 pr-2 !outline-none text-sans-md text-default placeholder:text-quaternary focus:ring-0"
                onChange={(e) => setFilterInput(e.target.value)}
              />
            </div>
          </div>
          <div id="scroll" className="flex-shrink flex-grow overflow-auto">
            {filterInput ? (
              results.length > 0 ? (
                <div className="pl-4 pr-4 pt-4">
                  <div className="mb-2 flex items-center text-sans-md text-default">
                    <Filter12Icon className="mr-2 text-quaternary" /> Results
                  </div>
                  {results.map((result) => (
                    <SensorItem
                      key={result.target}
                      sensor={result.obj}
                      isSelected={selectedComponent === result.obj.label}
                    />
                  ))}
                </div>
              ) : (
                <div className="pt-2 [&_h3]:text-sans-md">
                  <EmptyMessage
                    title="No matches"
                    icon={<Logs16Icon />}
                    body="Could not find a sensor with that label"
                  />
                </div>
              )
            ) : (
              <Accordion.Root type="multiple" defaultValue={['sensors']}>
                <SensorGroup value="sensors" items={allSensors} />
                <SensorGroup value="fans" items={[]} />
                <SensorGroup value="regulators" items={[]} />
              </Accordion.Root>
            )}
          </div>
        </Tabs.Content>
        <Tabs.Content value="options">Options</Tabs.Content>
      </Tabs.Root>
    </div>
  )
}

type SensorItemType = {
  label: string
  value: number
  showWarning?: boolean
  showUrgent?: boolean
}

const SensorGroup = ({ value, items }: { value: string; items: SensorItemType[] }) => {
  const { selectedComponent } = useMonitoring()

  return (
    <Accordion.Item
      value={value}
      className="accordion-item border-b p-4 border-b-secondary"
    >
      <Accordion.Header>
        <Accordion.Trigger className="-m-4 flex items-center p-4 text-sans-md text-default">
          <NextArrow12Icon className="arrow mr-2 transition-transform text-quaternary" />{' '}
          {titleCase(value)}
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="pb-3 pt-2">
        {items.map((sensor) => (
          <SensorItem
            key={sensor.label}
            sensor={sensor}
            isSelected={selectedComponent === sensor.label}
          />
        ))}
      </Accordion.Content>
    </Accordion.Item>
  )
}

const SensorItem = ({
  sensor,
  isSelected,
}: {
  sensor: SensorItemType
  isSelected: boolean
}) => {
  const { setSelectedComponent } = useMonitoring()

  const el = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isSelected && el.current) {
      el.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [isSelected])

  return (
    <button
      ref={el}
      key={sensor.label}
      className={cn(
        'relative flex w-full cursor-pointer items-center justify-between rounded py-0.5 pl-5 pr-2 text-sans-md text-secondary',
        'hover:bg-hover',
        isSelected &&
          'text-accent bg-accent-secondary hover:bg-accent-secondary-hover [&_span]:text-accent-secondary'
      )}
      onClick={() => {
        setSelectedComponent(sensor.label)
      }}
    >
      {isSelected && (
        <Close8Icon
          className="absolute left-1 -m-1 h-4 w-4 p-1"
          onClick={(e) => {
            setSelectedComponent(null)
            e.stopPropagation()
          }}
        />
      )}
      <div>{sensor.label}</div>{' '}
      <div>
        {sensor.showWarning && (
          <Warning12Icon
            className={`mr-1 ${sensor.showUrgent ? 'text-destructive' : 'text-notice'}`}
          />
        )}
        <span className="text-mono-sm text-tertiary">{sensor.value.toFixed(2)}</span>
      </div>
    </button>
  )
}
