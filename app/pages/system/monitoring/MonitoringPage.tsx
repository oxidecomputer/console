/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as Accordion from '@radix-ui/react-accordion'
import cn from 'classnames'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { NextArrow12Icon, Warning12Icon } from '@oxide/design-system/icons/react'

import { EquivalentCliCommand } from '~/components/EquivalentCliCommand'
import { sensorRanges, sensors, sensorValues } from '~/components/monitoring/data'
import { buttonStyle } from '~/ui/lib/Button'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { SettingsGroup } from '~/ui/lib/SettingsGroup'
import { Monitoring24Icon } from 'app/components/monitoring/Icons'
import { RouteTabs, Tab } from 'app/components/RouteTabs'
import { pb } from 'app/util/path-builder'

export function SystemMonitoringPage() {
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Monitoring24Icon />}>Monitoring</PageTitle>
      </PageHeader>
      <RouteTabs fullWidth>
        <Tab to={pb.systemMonitoringSensorTree()}>Sensor Tree</Tab>
        <Tab to={pb.systemMonitoringExplore()}>Explorer</Tab>
      </RouteTabs>
    </>
  )
}

export const SensorTreeTab = () => {
  return (
    <div className="w-full">
      <div className="flex w-full">
        <div className="w-5" />
        <div className="mb-2 flex flex-grow items-center text-mono-sm text-quaternary">
          <div className="w-[550px] pl-3">Sensors</div>
          <div className="border-l pl-3 border-secondary">Temperature</div>
        </div>
      </div>
      <div>
        <Accordion.Root type="multiple" defaultValue={['']}>
          {[...Array(32).keys()].map((index) => (
            <SensorTreeRow
              key={index}
              label={`Sled ${index}`}
              level={0}
              to={`/system/monitoring/explorer/sleds/${index}`}
            >
              <Accordion.Root type="multiple" defaultValue={['']}>
                <SensorTreeRow label="Air Sensors" level={1}>
                  {sensors
                    .filter((sensor) => sensor.type === 'air')
                    .map((sensor, index) => (
                      <SensorTreeRow
                        key={sensor.label}
                        label={sensor.label}
                        level={2}
                        end
                        last={index === sensors.length - 1}
                        index={index}
                      />
                    ))}
                </SensorTreeRow>
                <SensorTreeRow label="Component Sensors" level={1}>
                  {sensors
                    .filter(
                      (sensor) =>
                        sensor.type !== 'air' &&
                        sensor.type !== 'regulator' &&
                        sensor.type !== 'fan'
                    )
                    .map((sensor, index) => (
                      <SensorTreeRow
                        key={sensor.label}
                        label={sensor.label}
                        level={2}
                        end
                        last={index === sensors.length - 1}
                        index={index}
                      />
                    ))}
                </SensorTreeRow>
                <SensorTreeRow label="Fans" level={1} />
                <SensorTreeRow label="Regulators" level={1} />
              </Accordion.Root>
            </SensorTreeRow>
          ))}
        </Accordion.Root>
      </div>
    </div>
  )
}

const SensorTreeRow = ({
  children,
  label,
  level,
  end = false,
  last = false,
  index = 0,
  to,
}: {
  children?: ReactNode
  label: string
  level: number
  end?: boolean
  last?: boolean
  index?: number
  to?: string
}) => {
  const temperature = sensorValues[label]
  const temperatureRange = sensorRanges['air']
  const isUnhealthy = temperature
    ? temperature >= temperatureRange[1]
    : Math.random() < 0.08
      ? true
      : false

  return (
    <Accordion.Item
      value={label}
      className={cn('accordion-item', level !== 0 && 'ml-[20px]')}
    >
      <Accordion.Header className="my-1">
        <Accordion.Trigger className="group flex h-[32px] w-full items-center text-default">
          <div className="relative w-3">
            {end ? (
              last ? (
                <TreeNodeLast className="absolute left-[9px] top-[-21px]" />
              ) : (
                <TreeNode className="mt-1" />
              )
            ) : (
              <NextArrow12Icon className="arrow transition-transform text-secondary" />
            )}
          </div>
          <div
            className={cn(
              'ml-2 flex flex-grow items-center rounded-lg border text-sans-md text-secondary bg-default border-secondary hover:opacity-80',
              level === 0 && 'bg-tertiary',
              level === 1 && 'bg-raise',
              end ? 'z-0' : 'z-10'
            )}
          >
            <div
              className="w-[550px] py-2 pl-3 text-left"
              style={{
                width: `${550 - level * 20}px`,
              }}
            >
              {label}
            </div>
            <div className="flex h-[32px] flex-grow items-center justify-between border-l px-3 py-2 text-left content-[''] text-tertiary border-tertiary">
              <div className="flex items-center gap-2">
                {temperature}
                {isUnhealthy && <Warning12Icon className="text-notice-secondary" />}
              </div>

              {temperature && (
                <div className="flex items-end gap-[1.5px]">
                  {[...Array(12)].map((_e, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1 rounded-[0.5px]',
                        isUnhealthy && Math.random() < 0.2
                          ? 'bg-[var(--content-notice-tertiary)]'
                          : 'bg-[var(--base-neutral-300)]'
                      )}
                      style={{
                        height: `${Math.sin(Math.sin(i + index)) * 5 + 10}px`,
                      }} /* this is silly deterministic way to get random looking lengths */
                    />
                  ))}
                </div>
              )}

              {level === 0 && (
                <Link to={to}>
                  <NextArrow12Icon className="-translate-x-1 opacity-0 transition-transform text-secondary group-hover:translate-x-0 group-hover:opacity-100" />
                </Link>
              )}
            </div>
          </div>
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content className="flex flex-col">{children}</Accordion.Content>
    </Accordion.Item>
  )
}

const TreeNode = ({ className }: { className: string }) => (
  <svg
    width="21"
    height="40"
    viewBox="0 0 21 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <mask id="path-1-inside-1_587_19127" fill="white">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 0H9V19.5V20.5V40H10V20.5H21V19.5H10V0Z"
      />
    </mask>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 0H9V19.5V20.5V40H10V20.5H21V19.5H10V0Z"
      fill="#D9D9D9"
    />
    <path
      d="M9 0V-1H8V0H9ZM10 0H11V-1H10V0ZM9 40H8V41H9V40ZM10 40V41H11V40H10ZM10 20.5V19.5H9V20.5H10ZM21 20.5V21.5H22V20.5H21ZM21 19.5H22V18.5H21V19.5ZM10 19.5H9V20.5H10V19.5ZM9 1H10V-1H9V1ZM10 19.5V0H8V19.5H10ZM10 20.5V19.5H8V20.5H10ZM10 40V20.5H8V40H10ZM10 39H9V41H10V39ZM9 20.5V40H11V20.5H9ZM21 19.5H10V21.5H21V19.5ZM20 19.5V20.5H22V19.5H20ZM10 20.5H21V18.5H10V20.5ZM9 0V19.5H11V0H9Z"
      fill="#1C2225"
      mask="url(#path-1-inside-1_587_19127)"
    />
  </svg>
)

const TreeNodeLast = ({ className }: { className: string }) => (
  <svg
    width="12"
    height="21"
    viewBox="0 0 12 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <mask id="path-1-inside-1_712_13777" fill="white">
      <path fillRule="evenodd" clipRule="evenodd" d="M1 0H0V19.5V20V20.5H12V19.5H1V0Z" />
    </mask>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1 0H0V19.5V20V20.5H12V19.5H1V0Z"
      fill="#D9D9D9"
    />
    <path
      d="M0 0V-1H-1V0H0ZM1 0H2V-1H1V0ZM0 20.5H-1V21.5H0V20.5ZM12 20.5V21.5H13V20.5H12ZM12 19.5H13V18.5H12V19.5ZM1 19.5H0V20.5H1V19.5ZM0 1H1V-1H0V1ZM1 19.5V0H-1V19.5H1ZM1 20V19.5H-1V20H1ZM1 20.5V20H-1V20.5H1ZM12 19.5H0V21.5H12V19.5ZM11 19.5V20.5H13V19.5H11ZM1 20.5H12V18.5H1V20.5ZM0 0V19.5H2V0H0Z"
      fill="#1C2225"
      mask="url(#path-1-inside-1_712_13777)"
    />
  </svg>
)

export function ExplorerTab() {
  return (
    <SettingsGroup.Container>
      <SettingsGroup.Body>
        <SettingsGroup.Title>Explorer</SettingsGroup.Title>
        Enter the rack 3D sensor explorer
      </SettingsGroup.Body>
      <SettingsGroup.Footer>
        <EquivalentCliCommand command={'oxide'} />
        <Link to={pb.systemMonitoringExplorer()} className={buttonStyle({ size: 'sm' })}>
          Connect
        </Link>
      </SettingsGroup.Footer>
    </SettingsGroup.Container>
  )
}
