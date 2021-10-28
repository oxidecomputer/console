import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Add12Icon({
  title = 'Add',
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
        d="M6.5 5.5V0h-1v5.5H0v1h5.5V12h1V6.5H12v-1H6.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Add12Icon
