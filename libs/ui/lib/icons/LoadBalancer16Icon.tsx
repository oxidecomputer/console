import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function LoadBalancer16Icon({
  title = 'LoadBalancer',
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
        d="M11 0H5v5h2v2H2v4H0v5h6v-5H4V9h8v2h-2v5h6v-5h-2V7H9V5h2V0z"
        fill="currentColor"
      />
    </svg>
  )
}

export default LoadBalancer16Icon
