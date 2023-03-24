import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const LoadBalancer24Icon = ({
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
    <g id="24/load-balancer">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2C9.44772 2 9 2.44772 9 3V7C9 7.55228 9.44772 8 10 8H11V12H5H4C3.44772 12 3 12.4477 3 13V18C2.44772 18 2 18.4477 2 19V21C2 21.5523 2.44772 22 3 22H5C5.55228 22 6 21.5523 6 21V19C6 18.4477 5.55228 18 5 18V14H11V18C10.4477 18 10 18.4477 10 19V21C10 21.5523 10.4477 22 11 22H13C13.5523 22 14 21.5523 14 21V19C14 18.4477 13.5523 18 13 18V14H19V18C18.4477 18 18 18.4477 18 19V21C18 21.5523 18.4477 22 19 22H21C21.5523 22 22 21.5523 22 21V19C22 18.4477 21.5523 18 21 18V13C21 12.4477 20.5523 12 20 12H19H13V8H14C14.5523 8 15 7.55228 15 7V3C15 2.44772 14.5523 2 14 2H10Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default LoadBalancer24Icon
