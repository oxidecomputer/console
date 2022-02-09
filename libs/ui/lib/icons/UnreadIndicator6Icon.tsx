import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function UnreadIndicator6Icon({
  title = 'UnreadIndicator',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={6}
      height={6}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <circle cx={3} cy={3} r={3} fill="currentColor" />
    </svg>
  )
}

export default UnreadIndicator6Icon
