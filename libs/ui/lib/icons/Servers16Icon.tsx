import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Servers16Icon = ({
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
    <g id="16/servers">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.25 2C15.6642 2 16 2.33579 16 2.75V6.25C16 6.66421 15.6642 7 15.25 7H0.75C0.335786 7 0 6.66421 0 6.25V2.75C0 2.33579 0.335786 2 0.75 2H15.25ZM4 4.5C4 5.32843 3.32843 6 2.5 6C1.67157 6 1 5.32843 1 4.5C1 3.67157 1.67157 3 2.5 3C3.32843 3 4 3.67157 4 4.5ZM15.25 9C15.6642 9 16 9.33579 16 9.75V13.25C16 13.6642 15.6642 14 15.25 14H0.75C0.335786 14 0 13.6642 0 13.25V9.75C0 9.33579 0.335786 9 0.75 9H15.25ZM4 11.5C4 12.3284 3.32843 13 2.5 13C1.67157 13 1 12.3284 1 11.5C1 10.6716 1.67157 10 2.5 10C3.32843 10 4 10.6716 4 11.5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Servers16Icon
