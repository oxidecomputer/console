/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import * as R from 'remeda'
import { match } from 'ts-pattern'

import { api, q, type Sled, type PhysicalDisk } from '@oxide/api'
import { Servers16Icon, Servers24Icon } from '@oxide/design-system/icons/react'

import { DocsPopover } from '~/components/DocsPopover'
import { RouteTabs, Tab } from '~/components/RouteTabs'
import { makeCrumb } from '~/hooks/use-crumbs'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

export const handle = makeCrumb('Inventory', pb.sledInventory())

type CubbyDetails = {
  sled: Sled
  disks: PhysicalDisk[]
} | null

const Cubby = ({ cubby, row }: { cubby: CubbyDetails; row: 'one' | 'two' }) => {
  if (!cubby || !cubby.sled) {
    return (
      <span className="text-tertiary">
        {match(row)
          .with('one', () => '          ')
          .with('two', () => '          ')
          .exhaustive()}
      </span>
    )
  }

  const diskCount = cubby.disks.length

  return (
    <>
      <span className="text-accent">{'▊'.repeat(diskCount)}</span>
      <span className="text-quaternary">{'▊'.repeat(Math.max(0, 10 - diskCount))}</span>
    </>
  )
}

const RackViz = ({ sleds, disks }: { sleds: Sled[]; disks: PhysicalDisk[] }) => {
  const cubbies: CubbyDetails[][][] = R.chunk(
    R.chunk(
      Array(32) // please don't change the number of cubbies!
        .fill(null)
        .map((_, i) => {
          const sled = sleds.find(({ slot }) => slot === i)
          return sled
            ? {
                sled,
                disks: disks.filter((d) => d.sledId === sled.id),
              }
            : null
        }),
      2
    ).reverse(),
    8
  )

  const asciified = cubbies.map((half, halfIndex) =>
    half.map((row, rowIndex) => {
      const realRowBasis = 32 - (halfIndex * 8 + rowIndex + 1) * 2
      const [left, right] = row
      const [labelOne, labelTwo] = [
        `SLD${realRowBasis}`.padStart(5, ' '),
        `SLD${realRowBasis + 1}`,
      ]
      const sledRowOne = (
        <>
          <Cubby row="one" cubby={left} />
          {'  '}
          <Cubby row="one" cubby={right} />
        </>
      )
      const sledRowTwo = (
        <>
          <Cubby row="two" cubby={left} />
          {'  '}
          <Cubby row="two" cubby={right} />
        </>
      )
      return (
        <span key={rowIndex}>
          {labelOne} | {sledRowOne} | {labelTwo}
          {'\n'}
          {'     '} | {sledRowTwo} |{'\n'}
          {'      │                        │\n'}
        </span>
      )
    })
  )

  const head = `
      ┌────────────────────────┐
      │ 0xide rack     (front) │
      ├────────────────────────┤
      │                        │
`
  const belly = `      │ ┌────────────────────┐ │
  SW1 │ │::::::::    ::::::::│ │
      │ └────────────────────┘ │
 PWR1 │   ▁▁.▁▁.▁▁.▁▁.▁▁.▁▁.   │
 PWR0 │   ▁▁.▁▁.▁▁.▁▁.▁▁.▁▁.   │
      │ ┌────────────────────┐ │
  SW0 │ │::::::::    ::::::::│ │
      │ └────────────────────┘ │
      │                        │
`
  const caboose = `      └────────────────────────┘`

  return (
    <figure className="text-mono text-xs leading-none">
      <pre>
        {head}
        {asciified[0]}
        {belly}
        {asciified[1]}
        {caboose}
      </pre>
    </figure>
  )
}

export default function InventoryPage() {
  const { data: sleds } = useQuery(q(api.sledList, { query: { limit: ALL_ISH } }))
  const { data: disks } = useQuery(q(api.physicalDiskList, { query: { limit: ALL_ISH } }))

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Servers24Icon />}>Inventory</PageTitle>
        <DocsPopover
          heading="inventory"
          icon={<Servers16Icon />}
          summary="Information about the physical sleds and disks in the Oxide rack."
          links={[docLinks.sleds, docLinks.storage]}
        />
      </PageHeader>

      <div className="flex gap-8">
        <RouteTabs>
          <Tab to={pb.sledInventory()}>Sleds</Tab>
          <Tab to={pb.diskInventory()}>Disks</Tab>
        </RouteTabs>
        {sleds && disks && <RackViz sleds={sleds.items} disks={disks.items} />}
      </div>
    </>
  )
}
