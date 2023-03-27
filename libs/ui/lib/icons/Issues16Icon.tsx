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
        d="M2.75 1C2.33579 1 2 1.33579 2 1.75L2 2L2 8V13H1.75C1.33579 13 1 13.3358 1 13.75V14.25C1 14.6642 1.33579 15 1.75 15H2.75H3.25H4.25C4.66421 15 5 14.6642 5 14.25V13.75C5 13.3358 4.66421 13 4.25 13H4V8L7 8V9.25C7 9.66421 7.33579 10 7.75 10H12.25C12.6642 10 13 9.66421 13 9.25V4.75C13 4.33579 12.6642 4 12.25 4L9 4V2.75C9 2.33579 8.66421 2 8.25 2L4 2V1.75C4 1.33579 3.66421 1 3.25 1H2.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Issues16Icon
