/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router'
import { match } from 'ts-pattern'

import {
  api,
  q,
  queryClient,
  resendableAlertIds,
  useApiMutation,
  type AlertDelivery,
  type AlertProbeResult,
} from '@oxide/api'
import { Error12Icon, Success12Icon } from '@oxide/design-system/icons/react'
import { Button } from '@oxide/design-system/ui'

import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { ModalForm } from '~/components/form/ModalForm'
import { useAlertReceiverSelector } from '~/hooks/use-params'
import { EmptyCell } from '~/table/cells/EmptyCell'
import { CardBlock } from '~/ui/lib/CardBlock'
import { DateTime } from '~/ui/lib/DateTime'
import { EmptyMessage } from '~/ui/lib/EmptyMessage'
import { InlineCode } from '~/ui/lib/InlineCode'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { TableEmptyBox } from '~/ui/lib/Table'
import { ALL_ISH } from '~/util/consts'
import { pluralize } from '~/util/str'

import { attemptResultBadge } from './AlertReceiverDeliveries'

// Testing: send a liveness probe and show the result, plus static documentation
// of the signature scheme, which is defined by RFD 538 and implemented in
// https://github.com/oxidecomputer/omicron/blob/32615a35/nexus/src/app/webhook.rs

export function TestingTab() {
  return (
    <>
      <ReceiverTesterCard />
      <SignatureFormatCard />
    </>
  )
}

function ReceiverTesterCard() {
  const { receiver } = useAlertReceiverSelector()
  const [showProbeModal, setShowProbeModal] = useState(false)
  const [result, setResult] = useState<AlertProbeResult | null>(null)

  // fetched here rather than in the modal so it's usually ready by the time
  // the modal opens. the probe itself doesn't depend on it
  const { data: deliveries } = useQuery(
    q(api.alertDeliveryList, {
      path: { receiver },
      query: { limit: ALL_ISH, sortBy: 'time_and_id_descending' },
    })
  )

  return (
    <CardBlock>
      <CardBlock.Header
        title="Receiver tester"
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
        <ProbeModal
          deliveries={deliveries?.items}
          onDismiss={() => setShowProbeModal(false)}
          onSuccess={setResult}
        />
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
  const resends = result.resendsStarted

  return (
    <PropertiesTable>
      <PropertiesTable.Row label="Result">
        {attemptResultBadge(attempt.result)}
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Status">
        {status ? (
          <span className="flex items-center gap-1.5">
            {match(attempt.result)
              .with('succeeded', () => <Success12Icon className="text-accent" />)
              .with('failed_http_error', 'failed_unreachable', 'failed_timeout', () => (
                <Error12Icon className="text-error" />
              ))
              .exhaustive()}
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
      {/* null unless resends were requested and the probe succeeded */}
      {resends != null && (
        <PropertiesTable.Row label="Resends">
          {resends === 0 ? (
            'No failed deliveries to resend'
          ) : (
            <span className="flex items-center gap-2">
              {resends} {resends === 1 ? 'delivery' : 'deliveries'} requeued
              <Link to="?tab=deliveries" className="link-with-underline text-sans-md">
                View deliveries
              </Link>
            </span>
          )}
        </PropertiesTable.Row>
      )}
    </PropertiesTable>
  )
}

function ProbeModal({
  deliveries,
  onDismiss,
  onSuccess,
}: {
  /** undefined while the list is still loading */
  deliveries: AlertDelivery[] | undefined
  onDismiss: () => void
  onSuccess: (result: AlertProbeResult) => void
}) {
  const receiverSelector = useAlertReceiverSelector()
  const form = useForm({ defaultValues: { resend: false } })
  const resendCheckbox = deliveries && resendOption(deliveries)

  const sendProbe = useApiMutation(api.alertReceiverProbe, {
    onSuccess(result) {
      queryClient.invalidateEndpoint('alertDeliveryList')
      onSuccess(result)
      onDismiss()
    },
  })

  return (
    <ModalForm
      form={form}
      onDismiss={onDismiss}
      title="Send liveness probe"
      submitLabel="Send probe"
      submitError={sendProbe.error}
      loading={sendProbe.isPending}
      onSubmit={({ resend }) =>
        sendProbe.mutate({ path: receiverSelector, query: { resend } })
      }
    >
      <div className="space-y-4">
        <p>
          Sends a synthetic <InlineCode>probe</InlineCode> alert to the endpoint to check
          that it is reachable.
        </p>
        {resendCheckbox && (
          <CheckboxField
            name="resend"
            control={form.control}
            disabled={resendCheckbox.disabled}
          >
            Resend failed deliveries if the probe succeeds
            <span className="text-sans-sm text-tertiary mt-1 block">
              {resendCheckbox.note}
            </span>
          </CheckboxField>
        )}
      </div>
    </ModalForm>
  )
}

/**
 * The API has no endpoint for how many alerts a resend would requeue, so we
 * derive it from the first 1000-item page of the delivery list.
 */
function resendOption(deliveries: AlertDelivery[]) {
  if (deliveries.length === 0) return null

  const resendableCount = resendableAlertIds(deliveries).size
  // this is the only way we can tell whether there might be more
  const truncated = deliveries.length >= ALL_ISH

  return (
    match({ resendableCount, truncated })
      .with({ resendableCount: 0, truncated: false }, () => ({
        disabled: true,
        note: 'Every alert so far has reached this endpoint',
      }))
      // a truncated zero can't rule out older failures, so leave it enabled
      .with({ resendableCount: 0, truncated: true }, () => ({
        disabled: false,
        note: `No alerts to resend among the latest ${ALL_ISH.toLocaleString()} deliveries`,
      }))
      .otherwise(() => ({
        disabled: false,
        note: `${truncated ? 'At least ' : ''}${resendableCount} ${pluralize('alert', resendableCount)} would be resent`,
      }))
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
