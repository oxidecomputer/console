import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function MoreSmallIcon({
  title = 'More',
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 1h2v2H5V1zm0 4h2v2H5V5zm2 4H5v2h2V9z"
        fill="currentColor"
      />
    </svg>
  )
}

export default MoreSmallIcon
