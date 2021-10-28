import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Networking24Icon({
  title = 'Networking',
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
        d="M11 3H3v8h8V3zm10 0h-8v8h8V3zm-8 10h8v8h-8v-8zm-5 0H6v5h5v-2H8v-3z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Networking24Icon
