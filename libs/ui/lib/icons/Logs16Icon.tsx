import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Logs16Icon({
  title = 'Logs',
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
      <g fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4 3H0v4h4V3zm12 0H6v4h10V3zM6 9h10v4H6V9zm-5 3h2V7H1v5z"
        />
        <path d="M6 10H1v2h5v-2z" />
      </g>
    </svg>
  )
}

export default Logs16Icon
