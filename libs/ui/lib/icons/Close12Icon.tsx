import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Close12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={17}
    height={17}
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/close">
      <g id="12/add">
        <path
          id="Union"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.20832 8.49999L13.1042 4.60416L12.3958 3.89583L8.49999 7.79166L4.60416 3.89583L3.89583 4.60416L7.79166 8.49999L3.89583 12.3958L4.60416 13.1042L8.49999 9.20832L12.3958 13.1042L13.1042 12.3958L9.20832 8.49999Z"
          fill="#989A9B"
        />
      </g>
    </g>
  </svg>
)

export default Close12Icon
