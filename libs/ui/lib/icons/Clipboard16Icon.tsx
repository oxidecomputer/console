import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Clipboard16Icon({
  title = 'Clipboard',
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
        d="M10 1H6v2h4V1zM2 2h2v3h8V2h2v13H2V2z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Clipboard16Icon
