import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Health16Icon({
  title = 'Health',
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
        d="M8 3.228a4.05 4.05 0 015.793 0c1.61 1.626 1.61 4.292 0 5.918L8 15 2.207 9.081c-1.61-1.626-1.61-4.292 0-5.918A4.108 4.108 0 018 3.228z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Health16Icon
