import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function DirectionLeftIcon({
  title = 'Direction',
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
      <path d="M2 6l8 4V2L2 6z" fill="#48D597" />
    </svg>
  )
}

export default DirectionLeftIcon
