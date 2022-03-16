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
        d="M6 3h9v3h5v9h-8v-3H8v9H6V3z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Issues24Icon
