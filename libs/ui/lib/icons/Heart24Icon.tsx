import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Heart24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/heart">
      <path
        id="Vector"
        d="M12 3.88885C14.5287 1.38731 18.5747 1.38731 21.1034 3.88885C23.6322 6.39039 23.6322 10.4929 21.1034 12.9945L12 22L2.89655 12.8944C0.367816 10.3929 0.367816 6.29033 2.89655 3.78879C5.42529 1.38731 9.47126 1.38731 12 3.88885Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Heart24Icon
