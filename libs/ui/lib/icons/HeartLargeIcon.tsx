import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function HeartLargeIcon({
  title = 'Heart',
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
        d="M12 3.889a6.46 6.46 0 019.103 0 6.413 6.413 0 010 9.106L12 22l-9.103-9.106a6.413 6.413 0 010-9.105c2.528-2.402 6.574-2.402 9.103.1z"
        fill="#48D597"
      />
    </svg>
  )
}

export default HeartLargeIcon
