import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Subnet24Icon({
  title = 'Subnet',
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
        d="M10 2H2v8h3v4H2v8h8v-3h4v3h8v-8h-3v-4h3V2h-8v3h-4V2zm7 12v-4h-3V7h-4v3H7v4h3v3h4v-3h3z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Subnet24Icon
