import { Pagination } from './Pagination'

export const Default = () => (
  <Pagination
    pageSize={100}
    hasNext
    hasPrev={false}
    nextPage={undefined}
    onNext={() => {}}
    onPrev={() => {}}
  />
)
