import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Gateway24Icon({
  title = 'Gateway',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 2h14v20H5V2zm12 2l-7 3v9.753L17 20V4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Gateway24Icon
