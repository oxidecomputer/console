import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Image16Icon({
  title = 'Image',
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
        d="M1 5.088v6.869l6 2.608V7.66L1 5.088zm8 9.477l6-2.608V5.088L9 7.659v6.906zm4.69-11.091L8 1 2.31 3.474 8 5.912l5.69-2.438z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Image16Icon
