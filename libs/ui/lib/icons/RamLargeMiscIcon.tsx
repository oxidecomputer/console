import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const RamLargeMiscIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={19}
    height={19}
    viewBox="0 0 19 19"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="misc/ram-large">
      <path id="Vector" d="M17 14L18 14L18 12L17 12L17 14Z" fill="#989A9B" />
      <path id="Vector_2" d="M15 14L16 14L16 12L15 12L15 14Z" fill="#989A9B" />
      <path id="Vector_3" d="M13 14L14 14L14 12L13 12L13 14Z" fill="#989A9B" />
      <path id="Vector_4" d="M11 14L12 14L12 12L11 12L11 14Z" fill="#989A9B" />
      <path id="Vector_5" d="M9 14L10 14L10 12L9 12L9 14Z" fill="#989A9B" />
      <path id="Vector_6" d="M7 14L8 14L8 12L7 12L7 14Z" fill="#989A9B" />
      <path id="Vector_7" d="M5 14L6 14L6 12L5 12L5 14Z" fill="#989A9B" />
      <path id="Vector_8" d="M3 14L4 14L4 12L3 12L3 14Z" fill="#989A9B" />
      <path id="Vector_9" d="M0.999999 14L2 14L2 12L1 12L0.999999 14Z" fill="#989A9B" />
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 5.06667H19L19 6.99999C18.4477 6.99999 18 7.44771 18 7.99999C18 8.55228 18.4477 8.99999 19 8.99999V11H0V8.99999C0.552283 8.99999 1 8.55228 1 7.99999C1 7.44771 0.552285 6.99999 0 6.99999V5.06667ZM2 6H5V10H2V6ZM9 6H6V10H9V6ZM10 6H13V10H10V6ZM17 6H14V10H17V6Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default RamLargeMiscIcon
