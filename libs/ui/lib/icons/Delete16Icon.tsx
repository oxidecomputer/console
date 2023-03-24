import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Delete16Icon = ({
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
    <g id="16/delete">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.68934 0C9.88825 0 10.079 0.0790177 10.2197 0.21967L10.7803 0.78033C10.921 0.920983 11.1117 1 11.3107 1H13.25C13.6642 1 14 1.33579 14 1.75V2.25C14 2.66421 13.6642 3 13.25 3H2.75C2.33579 3 2 2.66421 2 2.25V1.75C2 1.33579 2.33579 1 2.75 1H4.68934C4.88825 1 5.07902 0.920982 5.21967 0.78033L5.78033 0.21967C5.92098 0.0790174 6.11175 0 6.31066 0H9.68934ZM3.75 5C3.33579 5 3 5.33579 3 5.75V15.25C3 15.6642 3.33579 16 3.75 16H12.25C12.6642 16 13 15.6642 13 15.25V5.75C13 5.33579 12.6642 5 12.25 5H3.75ZM6.5 7C6.77614 7 7 7.22386 7 7.5V13.5C7 13.7761 6.77614 14 6.5 14H5.5C5.22386 14 5 13.7761 5 13.5V7.5C5 7.22386 5.22386 7 5.5 7H6.5ZM9.5 7C9.22386 7 9 7.22386 9 7.5V13.5C9 13.7761 9.22386 14 9.5 14H10.5C10.7761 14 11 13.7761 11 13.5V7.5C11 7.22386 10.7761 7 10.5 7H9.5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Delete16Icon
