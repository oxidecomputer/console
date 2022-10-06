import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Terminal24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/terminal">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23 3H1V21H23V3ZM4 16V13.6154L9.73333 11L4 8.38462V6L12 9.92308V12.0769L4 16ZM20 16H12V18H20V16Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Terminal24Icon
