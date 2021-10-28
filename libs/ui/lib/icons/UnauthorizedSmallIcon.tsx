import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function UnauthorizedSmallIcon({
  title = 'Unauthorized',
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
        d="M6 12A6 6 0 106 0a6 6 0 000 12zm3-8L4 9 3 8l5-5 1 1z"
        fill="currentColor"
      />
    </svg>
  )
}

export default UnauthorizedSmallIcon
