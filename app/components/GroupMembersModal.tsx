/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'

import { api, q } from '~/api'
import { Modal } from '~/ui/lib/Modal'
import { Spinner } from '~/ui/lib/Spinner'
import { ALL_ISH } from '~/util/consts'

type GroupMembersModalProps = {
  groupId: string
  groupName: string
  onDismiss: () => void
}

export const GroupMembersModal = ({
  groupId,
  groupName,
  onDismiss,
}: GroupMembersModalProps) => {
  const { data: users, isLoading } = useQuery(
    q(api.userList, { query: { group: groupId, limit: ALL_ISH } })
  )

  const hasMore = users ? !!users.nextPage : false

  return (
    <Modal isOpen title={`Members of ${groupName}`} onDismiss={onDismiss}>
      <Modal.Body>
        <Modal.Section>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : !users ? (
            <div className="text-secondary">Failed to load members</div>
          ) : users.items.length === 0 ? (
            <div className="text-secondary">No members in this group</div>
          ) : (
            <>
              {hasMore && (
                <div className="text-sans-md text-secondary mb-3">
                  These are the first {users.items.length.toLocaleString()} results
                  returned.
                </div>
              )}
              <ul className="flex flex-col gap-2">
                {users.items.map((user) => (
                  <li key={user.id} className="text-default">
                    {user.displayName}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        actionText="Close"
        onAction={onDismiss}
        showCancel={false}
      />
    </Modal>
  )
}
