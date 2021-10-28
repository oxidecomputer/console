import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Hourglass16Icon({
  title = 'Hourglass',
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
        d="M4 0h8v5L8 8 4 5V0zm4 8l-4 3v5h8v-5L8 8zm-2 4v2h4v-2l-2-1.5L6 12z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Hourglass16Icon
