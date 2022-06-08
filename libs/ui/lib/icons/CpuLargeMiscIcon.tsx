import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const CpuLargeMiscIcon = ({
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
    <g id="misc/cpu-large">
      <path id="Vector" d="M14 5H5V14H14V5Z" fill="#989A9B" />
      <path id="Vector_2" d="M10 4L11 4L11 1L10 1L10 4Z" fill="#989A9B" />
      <path id="Vector_3" d="M10 18L11 18L11 15L10 15L10 18Z" fill="#989A9B" />
      <path id="Vector_4" d="M8 4L9 4L9 1L8 1L8 4Z" fill="#989A9B" />
      <path id="Vector_5" d="M8 18L9 18L9 15L8 15L8 18Z" fill="#989A9B" />
      <path id="Vector_6" d="M6 4L7 4L7 1L6 1L6 4Z" fill="#989A9B" />
      <path id="Vector_7" d="M6 18L7 18L7 15L6 15L6 18Z" fill="#989A9B" />
      <path id="Vector_8" d="M12 4L13 4L13 1L12 1L12 4Z" fill="#989A9B" />
      <path id="Vector_9" d="M12 18L13 18L13 15L12 15L12 18Z" fill="#989A9B" />
      <path id="Vector_10" d="M15 10L15 11L18 11L18 10L15 10Z" fill="#989A9B" />
      <path id="Vector_11" d="M1 10L1 11L4 11L4 10L1 10Z" fill="#989A9B" />
      <path id="Vector_12" d="M15 8L15 9L18 9L18 8L15 8Z" fill="#989A9B" />
      <path id="Vector_13" d="M1 8L1 9L4 9L4 8L1 8Z" fill="#989A9B" />
      <path id="Vector_14" d="M15 6L15 7L18 7L18 6L15 6Z" fill="#989A9B" />
      <path id="Vector_15" d="M1 6L1 7L4 7L4 6L1 6Z" fill="#989A9B" />
      <path id="Vector_16" d="M15 12L15 13L18 13L18 12L15 12Z" fill="#989A9B" />
      <path id="Vector_17" d="M1 12L1 13L4 13L4 12L1 12Z" fill="#989A9B" />
    </g>
  </svg>
)

export default CpuLargeMiscIcon
