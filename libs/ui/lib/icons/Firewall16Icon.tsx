import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Firewall16Icon({
  title = 'Firewall',
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
        d="M0 0h7v3H0V0zm0 13h7v3H0v-3zm16 0H9v3h7v-3zM0 5h3v6H0V5zm16 0h-3v6h3V5zM9 0h7v3H9V0zM6.6 11.09L8 12l1.4-.91c1-.69 1.6-1.854 1.6-3.126V5H5v2.964c0 1.272.6 2.472 1.6 3.127z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Firewall16Icon
