import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Cpu16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/cpu">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 0V3H9V0H11V3H12.25C12.6642 3 13 3.33579 13 3.75V5L16 5L16 7L13 7V9L16 9L16 11L13 11V12.25C13 12.6642 12.6642 13 12.25 13H11V16H9V13H7V16H5V13H3.75C3.33579 13 3 12.6642 3 12.25V11L0 11V9L3 9V7L0 7V5L3 5V3.75C3 3.33579 3.33579 3 3.75 3H5V0H7ZM7 9.00003V7.00003H9V9.00003H7ZM10.5 5.00003H5.5C5.22386 5.00003 5 5.22388 5 5.50003V10.5C5 10.7762 5.22385 11 5.5 11H10.5C10.7761 11 11 10.7762 11 10.5V5.50003C11 5.22388 10.7761 5.00003 10.5 5.00003Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Cpu16Icon
