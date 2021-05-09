// twin.d.ts
import 'twin.macro'
import type styledImport from '@emotion/styled'
import type { css as cssImport } from '@emotion/react'

declare module 'twin.macro' {
  // The styled and css imports
  const styled: typeof styledImport
  const css: typeof cssImport
}
