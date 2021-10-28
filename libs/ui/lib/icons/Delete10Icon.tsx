import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Delete10Icon({
  title = 'Delete',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={10}
      height={10}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.333 0H3.667L3 1H1v1h8V1H7l-.667-1zM2 3h6v7H2V3z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Delete10Icon
