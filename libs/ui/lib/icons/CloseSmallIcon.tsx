import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function CloseSmallIcon({
  title = 'Close',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={17}
      height={17}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <g fill="#48D597">
        <path d="M13.104 4.604l-8.5 8.5-.708-.708 8.5-8.5z" />
        <path d="M12.396 13.104l-8.5-8.5.708-.708 8.5 8.5z" />
      </g>
    </svg>
  )
}

export default CloseSmallIcon
