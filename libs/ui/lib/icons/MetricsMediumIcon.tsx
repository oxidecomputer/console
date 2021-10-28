import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function MetricsMediumIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1a6 6 0 016 6H9V1zM1 9a6 6 0 016-6v6h6A6 6 0 011 9z"
        fill="#48D597"
      />
    </svg>
  )
}

export default MetricsMediumIcon
