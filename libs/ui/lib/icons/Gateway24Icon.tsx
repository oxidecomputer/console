import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Gateway24Icon = ({
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
    <g id="24/gateway">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 1H21V23H3V1ZM18 3L10 6.375V17.3465L18 21V3Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Gateway24Icon
