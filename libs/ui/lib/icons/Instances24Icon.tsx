import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Instances24Icon = ({
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
    <g id="24/instances">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 3C7 2.44772 7.44772 2 8 2H21C21.5523 2 22 2.44772 22 3V16C22 16.5523 21.5523 17 21 17H19V6C19 5.44772 18.5523 5 18 5H7V3ZM3 7H16C16.5523 7 17 7.44772 17 8V21C17 21.5523 16.5523 22 16 22H3C2.44772 22 2 21.5523 2 21V8C2 7.44772 2.44772 7 3 7Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Instances24Icon
