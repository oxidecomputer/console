import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Terminal16Icon = ({
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
    <g id="16/terminal">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.75 1C0.335786 1 0 1.33579 0 1.75V14.25C0 14.6642 0.335786 15 0.75 15H15.25C15.6642 15 16 14.6642 16 14.25V1.75C16 1.33579 15.6642 1 15.25 1H0.75ZM3.08541 10.4573C2.58673 10.7066 2 10.344 2 9.78647V9.46353C2 9.17945 2.1605 8.91975 2.41459 8.79271L6 7L2.41459 5.20729C2.1605 5.08025 2 4.82055 2 4.53647V4.21353C2 3.65599 2.58673 3.29337 3.08541 3.54271L7.58541 5.79271C7.8395 5.91975 8 6.17945 8 6.46353V7.53647C8 7.82055 7.8395 8.08025 7.58541 8.20729L3.08541 10.4573ZM8 11.75C8 11.3358 8.33579 11 8.75 11H13.25C13.6642 11 14 11.3358 14 11.75V12.25C14 12.6642 13.6642 13 13.25 13H8.75C8.33579 13 8 12.6642 8 12.25V11.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Terminal16Icon
