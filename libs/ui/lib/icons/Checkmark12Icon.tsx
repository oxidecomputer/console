import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Checkmark12Icon = ({
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
    <g id="12/checkmark">
      <path
        id="checkmark"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 3.08912L4.97851 10L1 6.04266L2.18218 4.86678L4.89106 7.56125L9.7366 2L11 3.08912Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Checkmark12Icon
