import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Logs24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/logs">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 3H3H5H7V7H5V11H9V10H23V14H9V13H5L5 18H9V17H23V21H9V20H5H4H3L3 7H1V3ZM9 3H23V7H9V3Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Logs24Icon
