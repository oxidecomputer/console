import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Disabled12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/disabled">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12C9.31371 12 12 9.3137 12 5.99999C12 2.68628 9.31371 -9.26154e-06 6 -9.09295e-06C2.68629 -9.26154e-06 3.67839e-08 2.68628 2.89665e-07 5.99999C3.73959e-07 9.3137 2.68629 12 6 12ZM9.53552 6.70709L2.46446 6.70709V5.29288H9.53552L9.53552 6.70709Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Disabled12Icon
