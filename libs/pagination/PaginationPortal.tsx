import React, { useContext, useMemo, useState, useEffect } from 'react'

interface PaginationContextType {
  paginationComponent: JSX.Element | null
  renderPagination: (paginationComponent: JSX.Element | null) => void
}
const PaginationContext = React.createContext<PaginationContextType>({
  paginationComponent: null,
  renderPagination: () => {},
})

interface PaginatedAreaProps {
  children: React.ReactNode
}
/** The provider that should wrap the area where `PaginationPortal` and `PaginationTarget` can be used */
export const PaginationProvider = ({ children }: PaginatedAreaProps) => {
  const [paginationComponent, renderPagination] =
    useState<PaginationContextType['paginationComponent']>(null)

  const providerValue = useMemo(
    () => ({
      paginationComponent,
      renderPagination,
    }),
    [paginationComponent, renderPagination]
  )

  return (
    <PaginationContext.Provider value={providerValue}>
      {children}
    </PaginationContext.Provider>
  )
}

interface PaginationPortalProps {
  target: 'inline' | 'page'
  children: React.ReactNode
}
/** This component's provided children will be rendered at the `PaginationTarget` */
export const PaginationPortal = React.memo(
  ({ target, children }: PaginationPortalProps) => {
    const { paginationComponent, renderPagination } =
      useContext(PaginationContext)

    useEffect(() => {
      if (target === 'inline' && paginationComponent !== null) {
        renderPagination(null)
      } else if (target === 'page' && children !== paginationComponent) {
        renderPagination(children as JSX.Element)
      }
      // return () => renderPagination(null)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationComponent])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => renderPagination(null), [])

    return target === 'inline' ? (children as JSX.Element) : null
  }
)

/** Indicates where page level pagination should be rendered if applicable */
export const PaginationTarget = () => {
  const { paginationComponent } = useContext(PaginationContext)
  return paginationComponent ? (
    <>
      <hr className="!col-span-3 border-gray-400" />
      {paginationComponent}
    </>
  ) : null
}
