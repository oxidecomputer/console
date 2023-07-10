import { classed } from '@oxide/util'

/** Gets special styling from being inside `.ox-form` */
export const FormDivider = classed.hr`ox-divider w-full border-t border-secondary`

/** Needs !important styles to override :gutter thing on `<main>` */
export const Divider = classed.hr`!mx-0 !w-full border-t border-secondary`
