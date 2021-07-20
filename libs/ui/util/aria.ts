// neat trick for requiring aria-labelledby XOR aria-label on a component
//
//   type Props = { ...otherProps } & AriaLabel
//
// then use {...ariaLabel(props)} to put whichever one is actually there on the
// thing. This is better than { aria-labelledby?: string; aria-label?: string }
// because that lets you get away with neither (unless you check at runtime, ew)

export type AriaLabel =
  | {
      'aria-labelledby': string
      'aria-label'?: never
    }
  | {
      'aria-labelledby'?: never
      'aria-label': string
    }

export const ariaLabel = (props: AriaLabel) =>
  'aria-labelledby' in props
    ? { 'aria-labelled-by': props['aria-labelledby'] }
    : { 'aria-label': props['aria-label'] }
