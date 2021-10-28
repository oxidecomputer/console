import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SmallArrow12Icon({
  title = 'Small',
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
      <path d="M10 6L2 2v8l8-4z" fill="currentColor" />
    </svg>
  )
}

export default SmallArrow12Icon
