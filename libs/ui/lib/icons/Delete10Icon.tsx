import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Delete10Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={10}
    height={10}
    viewBox="0 0 10 10"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="10/delete">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.33333 0H3.66667L3 1H1V2H9V1H7L6.33333 0ZM2 3H8V10H2V3Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Delete10Icon
