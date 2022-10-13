import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Issues24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/issues">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 1H5V21H3V23H9V21H7V11H13V14H21V5L16 5V2L7 2L7 1Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Issues24Icon
