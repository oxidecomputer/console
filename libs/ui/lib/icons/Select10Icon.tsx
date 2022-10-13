import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Select10Icon = ({
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
    <g id="10/select">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0H10V2H0V0ZM0 4H10V6H0V4ZM10 8H0V10H10V8Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Select10Icon
