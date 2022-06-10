import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Access16Icon = ({
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
    <g id="16/access">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 13.2897C3.12027 12.1216 2 10.0884 2 7.93636V3L8 1L14 3V7.93636C14 10.0884 12.8797 12.0622 11 13.2837C10.9343 13.3264 10.8676 13.3682 10.8 13.4091L8 15L5.2 13.4091C5.13241 13.3704 5.06574 13.3306 5 13.2897ZM5 8V10.6743C5.32652 11.0656 5.72672 11.4055 6.19121 11.672L6.19398 11.6736L8 12.6997L9.7866 11.6846C10.2653 11.3921 10.6715 11.0404 11 10.6467V8H5ZM10 5C10 6.10457 9.10457 7 8 7C6.89543 7 6 6.10457 6 5C6 3.89543 6.89543 3 8 3C9.10457 3 10 3.89543 10 5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Access16Icon
