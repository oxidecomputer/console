import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Link16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/link">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 11V5L10 5V3H14H16V5V11V13H14H10V11H14ZM6 3V5H2L2 11H6V13H2H0V11V5V3H2H6ZM11 9V7H5V9H11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Link16Icon
