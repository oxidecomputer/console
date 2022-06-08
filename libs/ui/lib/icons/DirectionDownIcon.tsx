import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const DirectionDownIcon = ({
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
    <g id="Direction=Down">
      <g id="12/small-arrow">
        <path id="\xE2\x96\xB6" d="M6 10L10 2L2 2L6 10Z" fill="currentColor" />
      </g>
    </g>
  </svg>
)

export default DirectionDownIcon
