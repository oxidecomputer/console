import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Organization16Icon = ({
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
    <g id="16/organization">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0L11.3333 3.33332L8 6.66665L4.66668 3.33332L8 0ZM16 7.99996L12.6667 4.66664L9.33335 7.99996L12.6667 11.3333L16 7.99996ZM11.3333 12.6666L8 9.33331L4.66668 12.6666L8 16L11.3333 12.6666ZM6.66665 7.99996L3.33333 4.66664L7.64539e-06 7.99996L3.33333 11.3333L6.66665 7.99996Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Organization16Icon
