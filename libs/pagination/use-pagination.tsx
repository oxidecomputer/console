import { useState } from 'react'

type PageToken = string | undefined

export function usePagination() {
  const [prevPages, setPrevPages] = useState<PageToken[]>([])
  const [currentPage, setCurrentPage] = useState<PageToken>()

  const goToPrevPage = () => {
    const prevPage = prevPages.pop()
    setCurrentPage(prevPage)
    setPrevPages(prevPages)
  }

  const goToNextPage = (nextPageToken: string) => {
    setPrevPages([...prevPages, currentPage])
    setCurrentPage(nextPageToken)
  }

  return {
    currentPage,
    goToNextPage,
    goToPrevPage,
    hasPrev: prevPages.length > 0,
  }
}
