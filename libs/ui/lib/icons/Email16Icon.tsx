import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Email16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/email">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.99998 7L1.59998 3H14.4L7.99998 7ZM0 13V4L8 9L16 4V13H0Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Email16Icon
