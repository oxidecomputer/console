import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Issues16Icon({
  title = 'Issues',
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
        d="M2 1h7v2h5v7H7V8H4v7H2V1z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Issues16Icon
