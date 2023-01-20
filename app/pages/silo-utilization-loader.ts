/** Separate file because the page component is code-split and loaded async */
import { apiQueryClient } from '@oxide/api'

export const siloUtilizationPageloader = async () => {
  await apiQueryClient.prefetchQuery('organizationList', {})
  return null
}
