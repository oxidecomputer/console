import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Show16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/show">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 8C0 8 2.5 4 8 4C13.5 4 16 8 16 8C16 8 13.5 12 8 12C2.5 12 0 8 0 8ZM8 11C9.65685 11 11 9.65685 11 8C11 6.34315 9.65685 5 8 5C6.34315 5 5 6.34315 5 8C5 9.65685 6.34315 11 8 11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Show16Icon
