import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Hide16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/hide">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 1L14 2L11.427 4.57297L10.1213 5.87868L5.87868 10.1213L4.57297 11.427L2 14L1 13L3.18938 10.8106C1.01971 9.63154 0 8 0 8C0 8 2.5 4 8 4C8.65667 4 9.27057 4.05702 9.84256 4.15744L13 1ZM8.87146 5.12854C8.59568 5.04495 8.30309 5 8 5C6.34315 5 5 6.34315 5 8C5 8.30309 5.04495 8.59567 5.12854 8.87146L8.87146 5.12854ZM12.8106 5.18938L10.8715 7.12854C10.9551 7.40432 11 7.69691 11 8C11 9.65685 9.65685 11 8 11C7.69691 11 7.40433 10.9551 7.12854 10.8715L6.15744 11.8426C6.72943 11.943 7.34333 12 8 12C13.5 12 16 8 16 8C16 8 14.9803 6.36846 12.8106 5.18938Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Hide16Icon
