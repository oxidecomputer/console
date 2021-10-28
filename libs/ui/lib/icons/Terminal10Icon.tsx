import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Terminal10Icon({
  title = '',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={10}
      height={10}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1H0v8h10V1zM1 7V5.75L3.667 4.5 1 3.25V2l4 1.875v1.25L1 7zm4 0h4v1H5V7z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Terminal10Icon
