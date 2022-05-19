import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Key16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/key">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 0L16 2L15 3L16 4L15 5L14 4L13 5L14 6L12 8L11 7L9.39186 8.60814C9.77962 9.31862 10 10.1336 10 11C10 13.7614 7.76142 16 5 16C2.23858 16 0 13.7614 0 11C0 8.23858 2.23858 6 5 6C5.86643 6 6.68138 6.22038 7.39186 6.60814L14 0ZM5 13C6.10457 13 7 12.1046 7 11C7 9.89543 6.10457 9 5 9C3.89543 9 3 9.89543 3 11C3 12.1046 3.89543 13 5 13Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Key16Icon
