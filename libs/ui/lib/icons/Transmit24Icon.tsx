import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Transmit24Icon({
  title = 'Transmit',
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
        d="M4.515 15.861l-1.36 1.248A11.957 11.957 0 010 9C0 5.874 1.195 3.027 3.154.891L4.515 2.14A10.117 10.117 0 001.846 9c0 2.645 1.012 5.054 2.669 6.861zM16.763 4.634l1.361-1.248A8.278 8.278 0 0120.308 9a8.278 8.278 0 01-2.184 5.614l-1.36-1.248A6.438 6.438 0 0018.461 9a6.438 6.438 0 00-1.699-4.366zM22.153 9c0-2.645-1.01-5.054-2.668-6.861L20.845.89A11.957 11.957 0 0124 9c0 3.126-1.195 5.973-3.154 8.109l-1.361-1.248A10.117 10.117 0 0022.154 9zM5.877 14.614l1.36-1.248A6.438 6.438 0 015.539 9c0-1.683.644-3.216 1.699-4.366L5.876 3.386A8.278 8.278 0 003.692 9c0 2.164.828 4.135 2.184 5.614zM16 9c0 1.67-1.023 3.1-2.477 3.7L17 24H7l3.477-11.3A4.001 4.001 0 1116 9z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Transmit24Icon
