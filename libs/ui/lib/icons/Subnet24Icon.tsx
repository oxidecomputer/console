import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Subnet24Icon = ({
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
    <g id="24/subnet">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 2C2.44772 2 2 2.44772 2 3V9C2 9.55228 2.44772 10 3 10H5V14H3C2.44772 14 2 14.4477 2 15V21C2 21.5523 2.44772 22 3 22H9C9.55228 22 10 21.5523 10 21V19H14V21C14 21.5523 14.4477 22 15 22H21C21.5523 22 22 21.5523 22 21V15C22 14.4477 21.5523 14 21 14H19V10H21C21.5523 10 22 9.55228 22 9V3C22 2.44772 21.5523 2 21 2H15C14.4477 2 14 2.44772 14 3V5L10 5V3C10 2.44772 9.55228 2 9 2H3ZM17 14V10H15C14.4477 10 14 9.55228 14 9V7L10 7V9C10 9.55228 9.55228 10 9 10H7V14H9C9.55228 14 10 14.4477 10 15V17H14V15C14 14.4477 14.4477 14 15 14H17Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Subnet24Icon
