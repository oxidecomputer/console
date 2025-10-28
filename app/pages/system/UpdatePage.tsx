/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { differenceInMinutes } from 'date-fns'
import { useMemo, type SVGProps } from 'react'
import * as R from 'remeda'
import { lt as semverLt } from 'semver'

import {
  Images24Icon,
  SoftwareUpdate16Icon,
  SoftwareUpdate24Icon,
} from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import {
  apiq,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type UpdateStatus,
} from '~/api'
import { DocsPopover } from '~/components/DocsPopover'
import { HL } from '~/components/HL'
import { MoreActionsMenu } from '~/components/MoreActionsMenu'
import { RefreshButton } from '~/components/RefreshButton'
import { makeCrumb } from '~/hooks/use-crumbs'
import { confirmAction } from '~/stores/confirm-action'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { CardBlock } from '~/ui/lib/CardBlock'
import { DateTime } from '~/ui/lib/DateTime'
import { Divider } from '~/ui/lib/Divider'
import * as DropdownMenu from '~/ui/lib/DropdownMenu'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TipIcon } from '~/ui/lib/TipIcon'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { percentage, round } from '~/util/math'

export const handle = makeCrumb('System Update')

const SEC = 1000 // ms, obviously
const POLL_FAST = 20 * SEC
const POLL_SLOW = 120 * SEC

const statusQuery = apiq(
  'systemUpdateStatus',
  {},
  {
    refetchInterval({ state: { data: status } }) {
      if (!status) return false // should be impossible due to prefetch

      const now = new Date()
      const minSinceTargetSet = status.targetRelease
        ? differenceInMinutes(now, status.targetRelease.timeRequested)
        : null
      const minSinceLastStepPlanned = differenceInMinutes(now, status.timeLastStepPlanned)
      return minSinceLastStepPlanned < 30 ||
        (minSinceTargetSet !== null && minSinceTargetSet < 30)
        ? POLL_FAST
        : POLL_SLOW
    },
  }
)
const reposQuery = apiq('systemUpdateRepositoryList', { query: { limit: ALL_ISH } })

const refreshData = () =>
  Promise.all([
    queryClient.invalidateEndpoint('systemUpdateStatus'),
    queryClient.invalidateEndpoint('systemUpdateRepositoryList'),
  ])

export async function clientLoader() {
  await Promise.all([
    queryClient.prefetchQuery(statusQuery),
    queryClient.prefetchQuery(reposQuery),
  ])
  return null
}

function calcProgress(status: UpdateStatus) {
  const targetVersion = status.targetRelease?.version
  if (!targetVersion) return null

  const total = R.sum(Object.values(status.componentsByReleaseVersion))
  const current = status.componentsByReleaseVersion[targetVersion] || 0

  if (!total) return null // avoid dividing by zero

  return {
    current,
    total,
    // trunc prevents, e.g., 999/1000 being reported as 100%
    percentage: round(percentage(current, total), 0, 'trunc'),
  }
}

export default function UpdatePage() {
  const { data: status } = usePrefetchedQuery(statusQuery)
  const { data: repos } = usePrefetchedQuery(reposQuery)

  const { mutateAsync: setTargetRelease } = useApiMutation('targetReleaseUpdate', {
    onSuccess() {
      refreshData()
      addToast({ content: 'Target release updated' })
    },
    // error handled by confirm modal
  })

  const componentProgress = useMemo(() => calcProgress(status), [status])

  return (
    <>
      <PageHeader>
        <PageTitle icon={<SoftwareUpdate24Icon />}>System Update</PageTitle>
        <div className="flex items-center gap-2">
          <RefreshButton onClick={refreshData} />
          <DocsPopover
            heading="system update"
            icon={<SoftwareUpdate16Icon />}
            summary="The update system automatically updates components to the target release."
            links={[docLinks.systemUpdate]}
          />
        </div>
      </PageHeader>
      <PropertiesTable className="-mt-8">
        {/* targetRelease will never be null on a customer system after the
            first time it is set. */}
        <PropertiesTable.Row label="Target release">
          {status.targetRelease?.version ?? <EmptyCell />}
        </PropertiesTable.Row>
        <PropertiesTable.Row label="Target set">
          {status.targetRelease?.timeRequested ? (
            <DateTime date={status.targetRelease.timeRequested} />
          ) : (
            <EmptyCell />
          )}
        </PropertiesTable.Row>
        <PropertiesTable.Row
          label={
            <>
              Progress
              <TipIcon className="ml-1.5">
                Number of components updated to the target release
              </TipIcon>
            </>
          }
        >
          {componentProgress ? (
            <>
              <div className="mr-1.5">{componentProgress.percentage}%</div>
              <div className="text-tertiary">
                ({componentProgress.current} of {componentProgress.total})
              </div>
            </>
          ) : (
            <EmptyCell />
          )}
        </PropertiesTable.Row>
        <PropertiesTable.Row
          label={
            <>
              Last step planned{' '}
              <TipIcon className="ml-1.5">
                A rough indicator of the last time the update planner did something
              </TipIcon>
            </>
          }
        >
          <DateTime date={status.timeLastStepPlanned} />
        </PropertiesTable.Row>
        <PropertiesTable.Row
          label={
            <>
              Suspended{' '}
              <TipIcon className="ml-1.5">
                Whether automatic update is suspended due to manual update activity
              </TipIcon>
            </>
          }
        >
          {status.suspended ? 'Yes' : 'No'}
        </PropertiesTable.Row>
      </PropertiesTable>

      <Divider className="my-8" />

      <CardBlock>
        <CardBlock.Header title="Releases" />
        <CardBlock.Body>
          <ul className="space-y-3">
            {repos.items.map((repo) => {
              const targetVersion = status.targetRelease?.version
              const isTarget = repo.systemVersion === targetVersion
              // semverLt looks at prerelease meta but not build meta. In prod
              // it doesn't matter either way because there will be neither. On
              // dogfood it shouldn't matter because the versions will usually
              // be the same and with the same prelease meta and only differing
              // build meta, so semverLt will return false and we don't disable
              // any. Very important this is
              const olderThanTarget = targetVersion
                ? semverLt(repo.systemVersion, targetVersion)
                : false
              return (
                <li
                  key={repo.hash}
                  className="border-default @container flex items-center gap-2 rounded border pl-4"
                >
                  <Images24Icon className="text-quaternary shrink-0" aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col flex-wrap items-start gap-x-4 gap-y-1 py-3 @md:flex-row @md:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sans-semi-lg text-raise">
                          {repo.systemVersion}
                        </span>
                        {isTarget && <Badge color="default">Target</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-0.5 pr-2 @md:items-end">
                      <DateTime date={repo.timeCreated} />
                      <div className="flex items-center gap-0.5">
                        <HashIcon className="text-quaternary" aria-hidden />
                        <a
                          href={`https://github.com/oxidecomputer/omicron/commits/${repo.hash}`}
                          className="link-with-underline text-default"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {repo.hash.substring(0, 7)}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="border-secondary flex items-center justify-center self-stretch border-l">
                    <MoreActionsMenu
                      label={`${repo.systemVersion} actions`}
                      variant="filled"
                    >
                      <DropdownMenu.Item
                        label="Set as target release"
                        onSelect={() => {
                          confirmAction({
                            actionType: 'primary',
                            doAction: () =>
                              setTargetRelease({
                                body: { systemVersion: repo.systemVersion },
                              }),
                            modalTitle: 'Confirm set target release',
                            modalContent: (
                              <p>
                                Are you sure you want to set <HL>{repo.systemVersion}</HL>{' '}
                                as the target release?
                              </p>
                            ),
                            errorTitle: `Error setting target release to ${repo.systemVersion}`,
                          })
                        }}
                        disabled={
                          isTarget
                            ? 'Already set as target'
                            : olderThanTarget
                              ? 'Cannot set older release as target'
                              : false
                        }
                      />
                    </MoreActionsMenu>
                  </div>
                </li>
              )
            })}
          </ul>
        </CardBlock.Body>
      </CardBlock>
    </>
  )
}

const HashIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8.8338 0.967163L9.16681 1.03357C9.34546 1.06923 9.46113 1.24262 9.4256 1.42126L9.00958 3.50037H10.1707C10.3529 3.5005 10.5008 3.64827 10.5008 3.83044V4.17029C10.5008 4.35245 10.3528 4.50023 10.1707 4.50037H8.81036L8.20978 7.50037H9.17072C9.35285 7.5005 9.50079 7.64827 9.50079 7.83044V8.17029C9.50079 8.35245 9.35285 8.50023 9.17072 8.50037H8.01056L7.55548 10.7748C7.51965 10.9533 7.34537 11.0691 7.16681 11.0336L6.8338 10.9672C6.65508 10.9314 6.53926 10.7572 6.57501 10.5785L6.99103 8.50037H4.01056L3.55548 10.7748C3.51965 10.9533 3.34537 11.0691 3.16681 11.0336L2.8338 10.9672C2.65508 10.9314 2.53926 10.7572 2.57501 10.5785L2.99103 8.50037H1.83087C1.64862 8.50037 1.5008 8.35254 1.50079 8.17029V7.83044C1.50079 7.64819 1.64862 7.50037 1.83087 7.50037H3.19025L3.79083 4.50037H2.83087C2.64862 4.50037 2.5008 4.35254 2.50079 4.17029V3.83044C2.50079 3.64819 2.64862 3.50037 2.83087 3.50037H3.99005L4.44513 1.22595C4.48085 1.04733 4.65516 0.931576 4.8338 0.967163L5.16681 1.03357C5.34546 1.06923 5.46113 1.24262 5.4256 1.42126L5.00958 3.50037H7.99005L8.44513 1.22595C8.48085 1.04733 8.65516 0.931576 8.8338 0.967163ZM4.81036 4.50037L4.20978 7.50037H7.19025L7.79083 4.50037H4.81036Z"
      fill="currentColor"
    />
  </svg>
)
