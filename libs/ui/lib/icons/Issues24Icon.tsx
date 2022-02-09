import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Issues24Icon({
  title = 'Issues',
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
        d="M8 21v-9h4v3h8V6h-5V3H6v18h2z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Issues24Icon
