import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function AddIcon({
  title,
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
      <g fill="#48D597">
        <path d="M6.5 0v12h-1V0z" />
        <path d="M12 6.5H0v-1h12z" />
      </g>
    </svg>
  )
}

export default AddIcon
