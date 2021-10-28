import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function RacksLargeIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
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
        d="M1 1v6h22V1H1zm5 3a2 2 0 11-4 0 2 2 0 014 0zM1 15V9h22v6H1zm3-1a2 2 0 100-4 2 2 0 000 4zm-3 9v-6h22v6H1zm3-1a2 2 0 100-4 2 2 0 000 4z"
        fill="#48D597"
      />
    </svg>
  )
}

export default RacksLargeIcon
