/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'

import { api, queryClient, useApiMutation, type AlertProbeResult } from '@oxide/api'
import { Error12Icon, Success12Icon } from '@oxide/design-system/icons/react'
import { Button } from '@oxide/design-system/ui'

import { useAlertReceiverSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { CardBlock } from '~/ui/lib/CardBlock'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { InlineCode } from '~/ui/lib/InlineCode'
import { Modal } from '~/ui/lib/Modal'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'

import { attemptResultBadge } from './AlertReceiverDeliveries'

// Testing: send a liveness probe and show the result, plus static documentation
// of the signature scheme, which is defined by RFD 538 and implemented in
// https://github.com/oxidecomputer/omicron/blob/32615a35/nexus/src/app/webhook.rs

export function TestingTab() {
  return (
    <>
      <WebhookTesterCard />
      <SignatureFormatCard />
    </>
  )
}

function WebhookTesterCard() {
  const [showProbeModal, setShowProbeModal] = useState(false)
  const [result, setResult] = useState<AlertProbeResult | null>(null)

  return (
    <CardBlock>
      <CardBlock.Header
        title="Webhook tester"
        description="Send test alerts to your endpoint"
      >
        <Button size="sm" onClick={() => setShowProbeModal(true)}>
          Send liveness probe
        </Button>
      </CardBlock.Header>
      <CardBlock.Body>
        <p className="text-sans-md text-default">
          To test your integration, send a liveness probe to the endpoint.
        </p>
        {result ? (
          <ProbeResult result={result} />
        ) : (
          <TableEmptyBox>
            <EmptyMessage
              title="Probe result"
              body="Send a liveness probe to see the result here"
            />
          </TableEmptyBox>
        )}
      </CardBlock.Body>
      {showProbeModal && (
        <ProbeModal onDismiss={() => setShowProbeModal(false)} onSuccess={setResult} />
      )}
    </CardBlock>
  )
}

function ProbeResult({ result }: { result: AlertProbeResult }) {
  // a probe is delivered once and never retried, so there is at most one attempt
  const attempt = result.probe.attempts.webhook.at(0)
  if (!attempt) return null // can't happen: the API always returns the attempt it made

  const status = attempt.response?.status
  const durationMs = attempt.response?.durationMs

  return (
    <PropertiesTable>
      <PropertiesTable.Row label="Result">
        {attemptResultBadge(attempt.result)}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Status">
        {status ? (
          <span className="flex items-center gap-1.5">
            {attempt.result === 'succeeded' ? (
              <Success12Icon className="text-accent" />
            ) : (
              <Error12Icon className="text-error" />
            )}
            {status}
          </span>
        ) : (
          <EmptyCell />
        )}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Duration">
        {durationMs != null ? `${durationMs}ms` : <EmptyCell />}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Sent">
        <DateTime date={attempt.timeSent} />
      </PropertiesTable.Row>
    </PropertiesTable>
  )
}

function ProbeModal({
  onDismiss,
  onSuccess,
}: {
  onDismiss: () => void
  onSuccess: (result: AlertProbeResult) => void
}) {
  const receiverSelector = useAlertReceiverSelector()

  const sendProbe = useApiMutation(api.alertReceiverProbe, {
    onSuccess(result) {
      queryClient.invalidateEndpoint('alertDeliveryList')
      onSuccess(result)
      onDismiss()
    },
    onError(err) {
      addToast({ title: 'Could not send probe', content: err.message, variant: 'error' })
    },
  })

  return (
    <Modal isOpen onDismiss={onDismiss} title="Send liveness probe">
      <Modal.Body>
        <Modal.Section>
          <p>
            Sends a synthetic <InlineCode>probe</InlineCode> alert to the endpoint to check
            that it is reachable.
          </p>
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={() => sendProbe.mutate({ path: receiverSelector })}
        actionLoading={sendProbe.isPending}
        actionText="Send probe"
      />
    </Modal>
  )
}

const SIGNATURE_PARTS: [string, string][] = [
  ['algorithm', 'Currently only the SHA256 algorithm is supported'],
  ['secret-id', 'The ID of the secret used to create the signature'],
  ['signature', 'The HMAC signature of the request body'],
]

function SignatureFormatCard() {
  return (
    <CardBlock>
      <CardBlock.Header title="Signature format" />
      <CardBlock.Body>
        <p className="text-sans-md text-default">
          For each secret key assigned to a webhook receiver, an{' '}
          <InlineCode>x-oxide-signature</InlineCode> header is added with the HMAC digest of
          the payload signed with that secret key. This data is encoded in the following
          format:
        </p>
        <pre className="text-mono-md bg-raise border-secondary w-full rounded-md border px-4 py-3 tracking-normal! normal-case!">
          a=&#123;algorithm&#125;&id=&#123;secret-id&#125;&s=&#123;signature&#125;
        </pre>
        <dl className="text-sans-md space-y-1">
          {SIGNATURE_PARTS.map(([name, description]) => (
            <div key={name} className="flex gap-2">
              <dt className="text-sans-semi-md text-raise">{name}:</dt>
              <dd className="text-default">{description}</dd>
            </div>
          ))}
        </dl>
      </CardBlock.Body>
    </CardBlock>
  )
}
