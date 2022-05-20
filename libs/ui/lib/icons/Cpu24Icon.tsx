import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Cpu24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/cpu">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 4L11 4L11 0H13L13 4ZM18 6H6V18H18V6ZM24 13V11H20V13H24ZM24 15V17H20V15H24ZM24 9V7H20V9H24ZM4 11V13H0V11H4ZM4 17V15H0V17H4ZM4 7V9H0V7H4ZM11 24H13L13 20H11L11 24ZM9 24H7L7 20H9L9 24ZM15 24H17L17 20H15L15 24ZM7 4L9 4L9 0H7L7 4ZM17 4L15 4L15 0H17L17 4Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Cpu24Icon
