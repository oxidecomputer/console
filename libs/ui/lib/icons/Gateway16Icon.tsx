import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Gateway16Icon({
  title = 'Gateway',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 0h10v16H3V0zm8 2L6 4.25v7.314L11 14V2z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Gateway16Icon
