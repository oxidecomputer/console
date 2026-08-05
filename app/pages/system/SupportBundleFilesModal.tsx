/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { Fragment, useState } from 'react'
import { useNavigate } from 'react-router'

import {
  Document16Icon,
  Folder16Icon,
  Logs16Icon,
  PrevArrow12Icon,
} from '@oxide/design-system/icons/react'
import { Badge } from '@oxide/design-system/ui'

import { titleCrumb } from '~/hooks/use-crumbs'
import { useSupportBundleSelector } from '~/hooks/use-params'
import { Button } from '~/ui/lib/Button'
import { Message } from '~/ui/lib/Message'
import { ResourceLabel, SideModal } from '~/ui/lib/SideModal'
import { Spinner } from '~/ui/lib/Spinner'
import { truncate } from '~/ui/lib/Truncate'
import { pb } from '~/util/path-builder'
import {
  bundleDownloadUrl,
  bundleFileQuery,
  bundleFileUrl,
  bundleIndexQuery,
  isViewable,
  lsBundleDir,
  triggerDownload,
} from '~/util/support-bundle'

export const handle = titleCrumb('Support bundle files')

const entryRowStyle =
  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sans-md text-default hover:bg-hover'

function FileContent({ bundleId, filePath }: { bundleId: string; filePath: string }) {
  const { data, isError } = useQuery(bundleFileQuery(bundleId, filePath))

  if (isError) return <Message variant="error" content="Could not load file" />
  if (!data) return <Spinner />
  if (data.kind === 'tooLarge') {
    return (
      <Message
        variant="info"
        content="This file is too large to view here. Download it instead."
      />
    )
  }
  return (
    <pre className="text-mono-code text-default bg-default border-secondary overflow-auto rounded border p-3">
      {data.text}
    </pre>
  )
}

export default function SupportBundleFilesModal() {
  const navigate = useNavigate()
  const { bundleId } = useSupportBundleSelector()

  const [dir, setDir] = useState('')
  const [file, setFile] = useState<string | null>(null)

  const { data: entries, isError } = useQuery(bundleIndexQuery(bundleId))

  const onDismiss = () => navigate(pb.supportBundles())

  // dir is '' (root) or a path with a trailing slash, so the last segment is empty
  const dirSegments = dir.split('/').slice(0, -1)

  return (
    <SideModal
      isOpen
      title="Support bundle files"
      onDismiss={onDismiss}
      subtitle={
        <ResourceLabel>
          <Logs16Icon /> {truncate(bundleId, 14, 'middle')}
        </ResourceLabel>
      }
    >
      <SideModal.Body>
        {isError ? (
          <Message variant="error" content="Could not load bundle file list" />
        ) : !entries ? (
          <Spinner />
        ) : file ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>
                <PrevArrow12Icon className="mr-2" /> Back
              </Button>
              <div className="text-mono-code text-secondary truncate">{file}</div>
            </div>
            <FileContent bundleId={bundleId} filePath={file} />
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                triggerDownload(
                  bundleDownloadUrl(bundleId),
                  `support-bundle-${bundleId}.zip`
                )
              }
            >
              Download bundle
            </Button>
            <div className="text-mono-code text-secondary flex flex-wrap items-center">
              <button
                type="button"
                className="hover:text-raise rounded px-1"
                onClick={() => setDir('')}
              >
                /
              </button>
              {/* key by index because segment names can repeat within a path */}
              {dirSegments.map((segment, i) => (
                <Fragment key={i}>
                  <button
                    type="button"
                    className="hover:text-raise rounded px-1"
                    onClick={() => setDir(`${dirSegments.slice(0, i + 1).join('/')}/`)}
                  >
                    {segment}
                  </button>
                  {i < dirSegments.length - 1 && <span>/</span>}
                </Fragment>
              ))}
            </div>
            <div>
              {lsBundleDir(entries, dir).map((entry) =>
                entry.isDir ? (
                  <button
                    key={entry.path}
                    type="button"
                    className={entryRowStyle}
                    onClick={() => setDir(entry.path)}
                  >
                    <Folder16Icon className="text-secondary shrink-0" /> {entry.name}
                  </button>
                ) : isViewable(entry.path) ? (
                  <button
                    key={entry.path}
                    type="button"
                    className={entryRowStyle}
                    onClick={() => setFile(entry.path)}
                  >
                    <Document16Icon className="text-secondary shrink-0" /> {entry.name}
                  </button>
                ) : (
                  <button
                    key={entry.path}
                    type="button"
                    className={entryRowStyle}
                    onClick={() =>
                      triggerDownload(bundleFileUrl(bundleId, entry.path), entry.name)
                    }
                  >
                    <Document16Icon className="text-secondary shrink-0" /> {entry.name}
                    <Badge color="neutral">download</Badge>
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </SideModal.Body>
      <SideModal.Footer>
        {file ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              // basename can't be empty: file is a full path from the index
              triggerDownload(bundleFileUrl(bundleId, file), file.split('/').at(-1)!)
            }
          >
            Download file
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Close
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
