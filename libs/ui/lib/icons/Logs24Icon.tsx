import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Logs24Icon({
  title = 'Logs',
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
        d="M2 4h4v4H5v3h3v-1h14v4H8v-1H5v4h3v-1h14v4H8v-1H3V8H2V4zm6 0h14v4H8V4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Logs24Icon
