import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const RamSmallMiscIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={15}
    height={15}
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="misc/ram-small">
      <path id="Vector" d="M13 11L14 11L14 10L13 10L13 11Z" fill="#989A9B" />
      <path id="Vector_2" d="M11 11L12 11L12 10L11 10L11 11Z" fill="#989A9B" />
      <path id="Vector_3" d="M9 11L10 11L10 10L9 10L9 11Z" fill="#989A9B" />
      <path id="Vector_4" d="M7 11L8 11L8 10L7 10L7 11Z" fill="#989A9B" />
      <path id="Vector_5" d="M5 11L6 11L6 10L5 10L5 11Z" fill="#989A9B" />
      <path id="Vector_6" d="M3 11L4 11L4 10L3 10L3 11Z" fill="#989A9B" />
      <path id="Vector_7" d="M0.999999 11L2 11L2 10L1 10L0.999999 11Z" fill="#989A9B" />
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 4H15L15 5.99999H14L14 6.99999L15 6.99999L15 9H0V4ZM4.05312e-06 6.99999L1 6.99999L1 5.99999H4.05312e-06V6.99999Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default RamSmallMiscIcon
