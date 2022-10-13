import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Subnet16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/subnet">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0H6V2L10 2V0H16V6H14V10H16V16H10V14H6V16H0V10H2V6H0V0ZM6 12H10V10H12V6H10V4H6V6H4V10H6V12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Subnet16Icon
