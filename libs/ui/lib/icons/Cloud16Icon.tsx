import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Cloud16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/cloud">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.3333 7L13.3333 7.01831C14.8333 7.18411 16 8.4558 16 10C16 11.6569 14.6569 13 13 13C12.9989 13 12.9977 13 12.9966 13H4C1.79086 13 0 11.2091 0 9C0 6.87621 1.65516 5.139 3.74592 5.00794C4.51565 3.2378 6.27994 2 8.33333 2C11.0948 2 13.3333 4.23858 13.3333 7Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Cloud16Icon
