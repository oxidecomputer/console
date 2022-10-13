import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Resize24Icon = ({
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
    <g id="24/resize">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 5V12H22V5V2H19H12V5H19ZM7 7H17V17H7V7ZM12 19V22H5H2V19V12H5L5 19H12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Resize24Icon
