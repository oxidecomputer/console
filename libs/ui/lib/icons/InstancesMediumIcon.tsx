import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function InstancesMediumIcon({
  title = 'Instances',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
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
        d="M6 3V1h9v9h-2V3H6zM1 15V5h10v10H1z"
        fill="#48D597"
      />
    </svg>
  )
}

export default InstancesMediumIcon
