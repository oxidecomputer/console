import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const SoftwareUpdate24Icon = ({
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
    <g id="24/software-update">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.9896 11.4115C19.9965 11.2752 20 11.138 20 11C20 6.58172 16.4183 3 12 3C8.00782 3 4.69862 5.9242 4.09747 9.74752C2.25045 10.7704 1 12.7392 1 15C1 18.3137 3.68629 21 7 21H18C20.7614 21 23 18.7614 23 16C23 13.9457 21.7611 12.1807 19.9896 11.4115ZM11 13V8H13V13L17 13L12 18L7 13H11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default SoftwareUpdate24Icon
