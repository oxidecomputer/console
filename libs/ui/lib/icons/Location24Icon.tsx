import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Location24Icon = ({
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
    <g id="24/location">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 11.9C15.2822 11.4367 17 9.41896 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.41896 8.71776 11.4367 11 11.9V23H13V11.9Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Location24Icon
