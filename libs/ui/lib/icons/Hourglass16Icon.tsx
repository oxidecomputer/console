import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Hourglass16Icon = ({
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
    <g id="16/hourglass">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 0H12V5L8 8L4 5V0ZM8 8L4 11V14V16H6H10H12V14V11L8 8ZM6 12V14H10V12L8 10.5L6 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Hourglass16Icon
