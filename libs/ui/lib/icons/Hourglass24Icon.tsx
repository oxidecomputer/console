import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Hourglass24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/hourglass">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 2C3 1.44772 3.44772 1 4 1H6H18H20C20.5523 1 21 1.44772 21 2C21 2.55228 20.5523 3 20 3H18V7.46482C18 7.79917 17.8329 8.1114 17.5547 8.29687L12 12L6.4453 8.29687C6.1671 8.1114 6 7.79917 6 7.46482L6 3H4C3.44772 3 3 2.55228 3 2ZM12 12L6.4453 15.7031C6.1671 15.8886 6 16.2008 6 16.5352V21H4C3.44772 21 3 21.4477 3 22C3 22.5523 3.44772 23 4 23H6H18H20C20.5523 23 21 22.5523 21 22C21 21.4477 20.5523 21 20 21H18V16.5352C18 16.2008 17.8329 15.8886 17.5547 15.7031L12 12ZM8 21V17.0704L12 14.4037L16 17.0704V21H8Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Hourglass24Icon
