import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Question16Icon({
  title = 'Question',
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
        d="M8 15A7 7 0 108 1a7 7 0 000 14zm.469-5.163H7.25v-.081c.009-1.581.477-2.063 1.27-2.549.507-.315.903-.762.903-1.397 0-.755-.588-1.236-1.312-1.236-.652 0-1.296.396-1.347 1.3H5.47C5.524 4.339 6.675 3.5 8.11 3.5c1.564 0 2.612.938 2.612 2.322 0 .96-.469 1.607-1.232 2.067-.724.448-1.005.887-1.022 1.867v.08zm.277 1.738a.852.852 0 11-1.705 0c0-.464.384-.848.852-.848.465 0 .853.384.853.848z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Question16Icon
