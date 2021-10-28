import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function DirectionUpIcon({
  title = 'Direction',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path d="M6 2l-4 8h8L6 2z" fill="currentColor" />
    </svg>
  )
}

export default DirectionUpIcon
