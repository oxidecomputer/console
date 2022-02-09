import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Snapshots16Icon({
  title = 'Snapshots',
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
        d="M8 1L1 4l7 3 7-3-7-3zM1 6l7 3 7-3v2l-7 3-7-3V6zm7 7l-7-3v2l7 3 7-3v-2l-7 3z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Snapshots16Icon
