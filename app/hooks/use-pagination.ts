/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback, useState } from 'react'

type PageToken = string | undefined

/**
 * @param queryId Identifies the query being paginated. When it changes, we jump
 * back to the first page: a page token is only meaningful for the query that
 * produced it, so carrying one across a query change (e.g., a filter above the
 * table) means asking the API to resume from a position that doesn't exist in
 * the new result set.
 */
export function usePagination(queryId?: string) {
  const [prevPages, setPrevPages] = useState<PageToken[]>([])
  const [currentPage, setCurrentPage] = useState<PageToken>()

  // Adjusting state during render rather than in an effect, as recommended by
  // https://react.dev/learn/you-might-not-need-an-effect. An effect would let a
  // render go out with the stale token, firing off a bogus request.
  const [prevQueryId, setPrevQueryId] = useState(queryId)
  if (queryId !== prevQueryId) {
    setPrevQueryId(queryId)
    setPrevPages([])
    setCurrentPage(undefined)
  }

  const goToPrevPage = useCallback(() => {
    const prevPage = prevPages.pop()
    setCurrentPage(prevPage)
    setPrevPages(prevPages)
  }, [prevPages])

  const goToNextPage = useCallback(
    (nextPageToken: string) => {
      setPrevPages((prevPages) => [...prevPages, currentPage])
      setCurrentPage(nextPageToken)
    },
    [currentPage]
  )

  return {
    currentPage,
    goToNextPage,
    goToPrevPage,
    hasPrev: prevPages.length > 0,
  }
}
