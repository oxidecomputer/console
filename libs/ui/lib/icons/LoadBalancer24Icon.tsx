import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function LoadBalancer24Icon({
  title = 'LoadBalancer',
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
        d="M15 2H9v5h2v3H3v7H1v5h6v-5H5v-5h6v5H9v5h6v-5h-2v-5h6v5h-2v5h6v-5h-2v-7h-8V7h2V2z"
        fill="currentColor"
      />
    </svg>
  )
}

export default LoadBalancer24Icon
