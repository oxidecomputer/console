import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Error16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/error">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM5.53031 4.46965L8 6.93934L10.4697 4.46967L11.5303 5.53033L9.06066 8L11.5303 10.4697L10.4697 11.5303L8 9.06066L5.53031 11.5304L4.46965 10.4697L6.93934 8L4.46965 5.53031L5.53031 4.46965Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Error16Icon
