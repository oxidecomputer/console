import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Firewall24Icon({
  title = 'Firewall',
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
        d="M2 2h9v5H2V2zm0 15h9v5H2v-5zm5-8H2v6h5V9zm10 0h5v6h-5V9zm5-7h-9v5h9V2zm-9 15h9v5h-9v-5zm-2.4-1.91L12 16l1.4-.91c1-.69 1.6-1.854 1.6-3.126V9H9v2.964c0 1.272.6 2.472 1.6 3.127z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Firewall24Icon
