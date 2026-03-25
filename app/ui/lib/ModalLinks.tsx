/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'

import { OpenLink12Icon } from '@oxide/design-system/icons/react'

import { FormDivider } from '~/ui/lib/Divider'

const DOC_BASE = 'https://docs.oxide.computer'

export const ModalLinks = ({
  heading,
  children,
}: {
  heading: string
  children: ReactNode
}) => (
  <div>
    <h3 className="text-sans-semi-md text-raise mb-2">{heading}</h3>
    <ul className="text-sans-md text-secondary space-y-1">{children}</ul>
  </div>
)

export const ModalLink = ({ to, label }: { to: string; label: string }) => (
  <li>
    <a
      href={to}
      key={to}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center space-x-2"
    >
      <OpenLink12Icon className="text-accent group-hover:text-accent" />
      <span className="group-hover:text-raise">{label}</span>
    </a>
  </li>
)

type DocLink = { href: string; linkText: string }

/**
 * `apiOp` is a snake_case operation ID, e.g., "project_create".
 * `cliCmd` is a slash-delimited CLI path, e.g., "project/create".
 */
export const SideModalFormDocs = ({
  docs,
  apiOp,
  cliCmd,
}: {
  docs: DocLink[]
  apiOp?: string
  cliCmd?: string
}) => (
  <>
    <FormDivider />
    <ModalLinks heading="Relevant docs">
      {docs.map(({ href, linkText }) => (
        <ModalLink key={href} to={href} label={linkText} />
      ))}
      {apiOp && (
        <li>
          <a
            href={`${DOC_BASE}/api/${apiOp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center space-x-2"
          >
            <OpenLink12Icon className="text-accent group-hover:text-accent" />
            <span className="group-hover:text-raise">
              API:{' '}
              <code className="text-mono-sm tracking-normal! normal-case!">{apiOp}</code>
            </span>
          </a>
        </li>
      )}
      {cliCmd && (
        <li>
          <a
            href={`${DOC_BASE}/cli/${cliCmd}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center space-x-2"
          >
            <OpenLink12Icon className="text-accent group-hover:text-accent" />
            <span className="group-hover:text-raise">
              CLI:{' '}
              <code className="text-mono-sm tracking-normal! normal-case!">
                oxide {cliCmd.replaceAll('/', ' ')}
              </code>
            </span>
          </a>
        </li>
      )}
    </ModalLinks>
  </>
)
