import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const More12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/more">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 1H7V3H5V1ZM5 5H7V7H5V5ZM7 9H5V11H7V9Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default More12Icon
