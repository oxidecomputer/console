import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Instances24Icon({
  title = 'Instances',
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
        d="M7 5V2h15v15h-3V5H7zM2 7h15v15H2V7z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Instances24Icon
