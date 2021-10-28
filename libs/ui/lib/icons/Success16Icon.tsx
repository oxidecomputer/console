import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Success16Icon({
  title = '',
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
        d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.47-9.93L7.2 9.34 5.33 7.47 4.27 8.53l2.4 2.4.53.53.53-.53 4.8-4.8-1.06-1.06z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Success16Icon
