import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Comment16Icon({
  title = 'Comment',
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
        d="M5 2h2L4 14H2L5 2zm7 0h2l-3 12H9l3-12z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Comment16Icon
