import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Router24Icon({
  title = 'Router',
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
        d="M16 5l-4-4-4 4h2v4h4V5h2zm-1 7l4-4v2h4v4h-4v2l-4-4zM5 10H1v4h4v2l4-4-4-4v2zm9 9v-4h-4v4H8l4 4 4-4h-2z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Router24Icon
