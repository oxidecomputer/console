import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Terminal10Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={10}
    height={10}
    viewBox="0 0 10 10"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="10/terminal">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1H0V9H10V1ZM1 7V5.75L3.66667 4.5L1 3.25V2L5 3.875V5.125L1 7ZM5 7H9V8H5V7Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Terminal10Icon
