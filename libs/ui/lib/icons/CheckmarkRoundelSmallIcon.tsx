import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function CheckmarkRoundelSmallIcon({
  title = 'CheckmarkRoundel',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12A6 6 0 106 0a6 6 0 000 12zm-.043-3.498l3.6-4-1.114-1.004-3.084 3.427L3.517 5.17 2.483 6.257l2.4 2.286.558.532.516-.573z"
        fill="#48D597"
      />
    </svg>
  )
}

export default CheckmarkRoundelSmallIcon
