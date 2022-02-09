import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Subnet16Icon({
  title = 'Subnet',
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
      <g fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0h6v6H4v4h2v6H0v-6h2V6H0V0zm10 0h6v6h-2v4h2v6h-6v-6h2V6h-2V0z"
        />
        <path d="M11 4V2H5v2h6zM11 14v-2H5v2h6z" />
      </g>
    </svg>
  )
}

export default Subnet16Icon
