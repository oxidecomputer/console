import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Logs16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/logs">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 3H4V7H0V3ZM6 3H16V7H6V3ZM16 9H6V9.99999L3 9.99999L3 7.00002H1L1 9.99999L1 12L1 12H3V12L6 12V13H16V9Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Logs16Icon
