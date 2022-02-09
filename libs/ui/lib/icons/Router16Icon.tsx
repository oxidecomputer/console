import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Router16Icon({
  title = 'Router',
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
        d="M9 0l5 4-5 4V6H3V2h6V0zM7 8l-5 4 5 4v-2h6v-4H7V8z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Router16Icon
