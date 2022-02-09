import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Loader12Icon({
  title = 'Loader',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <g strokeWidth={1.5}>
        <circle cx={6} cy={6} r={5.25} stroke="#353C40" />
        <path d="M6 .75a5.25 5.25 0 014.536 7.893" stroke="#48D597" />
      </g>
    </svg>
  )
}

export default Loader12Icon
