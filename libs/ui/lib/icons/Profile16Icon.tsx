import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Profile16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/profile">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 14.3264C13.3649 13.2029 15 10.7924 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 10.7924 2.63505 13.2029 5 14.3264C5.90926 14.7583 6.9264 15 8 15C9.0736 15 10.0907 14.7583 11 14.3264ZM11 9V12.0004C10.1643 12.6281 9.12561 13 8 13C6.87439 13 5.83566 12.6281 5 12.0004V9H11ZM10 6C10 7.10457 9.10457 8 8 8C6.89543 8 6 7.10457 6 6C6 4.89543 6.89543 4 8 4C9.10457 4 10 4.89543 10 6Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Profile16Icon
