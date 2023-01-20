/** Separate file because the page component is code-split and loaded async */
import { apiQueryClient } from '@oxide/api'

export const capacityUtilizationPageLoader = async () => {
  await apiQueryClient.prefetchQuery('siloList', {})
  return null
}
