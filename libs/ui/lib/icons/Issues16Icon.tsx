import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Issues16Icon = ({
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
    <g id="16/issues">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 1H4H9V3L14 3V10H7V8L4 8V15H2V8V1Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Issues16Icon
