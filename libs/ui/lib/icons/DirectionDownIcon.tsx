import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function DirectionDownIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M6 10l4-8H2l4 8z" fill="#48D597" />
    </svg>
  )
}

export default DirectionDownIcon
