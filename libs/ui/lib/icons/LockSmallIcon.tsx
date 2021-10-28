import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function LockSmallIcon({
  title = 'Lock',
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5h4V4a2 2 0 10-4 0v1zM2 5H1v7h10V5h-1V4a4 4 0 10-8 0v1z"
        fill="#48D597"
      />
    </svg>
  )
}

export default LockSmallIcon
