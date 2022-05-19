import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const SelectArrows6Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={6}
    height={14}
    viewBox="0 0 6 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="6/select-arrows">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 5L3 0L0 5L6 5ZM0 9L3 14L6 9H0Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default SelectArrows6Icon
