import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Hourglass24Icon({
  title = 'Hourglass',
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
        d="M7 2h10v6l-5 4-5-4V2zm2 14.961V20h6v-3.039l-3-2.4-3 2.4zM12 12l5 4v6H7v-6l5-4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Hourglass24Icon
