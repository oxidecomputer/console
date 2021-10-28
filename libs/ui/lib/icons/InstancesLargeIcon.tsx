import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function InstancesLargeIcon({
  title = 'Instances',
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
        d="M7 5V2h15v15h-3V5H7zM2 7h15v15H2V7z"
        fill="#48D597"
      />
    </svg>
  )
}

export default InstancesLargeIcon
