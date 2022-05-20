import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Images16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/images">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 5.08799V11.9565L7 14.5652V7.65941L1 5.08799ZM9 14.5652L15 11.9565V5.08798L9 7.65941V14.5652ZM13.6895 3.47369L8 1L2.3105 3.47369L8 5.91205L13.6895 3.47369Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Images16Icon
