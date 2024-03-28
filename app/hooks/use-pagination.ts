/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useCallback, useState } from 'react'

type PageToken = string | undefined

export function usePagination() {
  const [prevPages, setPrevPages] = useState<PageToken[]>([])
  const [currentPage, setCurrentPage] = useState<PageToken>()

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
