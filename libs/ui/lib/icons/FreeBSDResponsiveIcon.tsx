import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function FreeBSDResponsiveIcon({
  title = 'FreeBSD',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M14.84 1.239c.742.753-1.315 4.065-1.663 4.418-.348.353-1.231.029-1.973-.725-.742-.753-1.062-1.651-.714-2.004.347-.353 3.608-2.443 4.35-1.689zm-10.407.797C3.3 1.383 1.688.656 1.175 1.178c-.52.527.221 2.202.871 3.355a7.02 7.02 0 012.387-2.497zm9.275 3.362c.104.359.086.656-.084.828-.395.401-1.463-.027-2.425-.957A4.986 4.986 0 0111 5.078 4.38 4.38 0 0110.208 4c-.337-.613-.421-1.156-.166-1.414.138-.141.36-.18.631-.13.177-.114.385-.24.614-.37a6.621 6.621 0 00-3.11-.77c-3.72 0-6.736 3.062-6.736 6.841C1.441 11.936 4.457 15 8.178 15c3.72 0 6.737-3.063 6.737-6.842a6.89 6.89 0 00-.866-3.357c-.109.202-.222.401-.341.597z"
        fill="currentColor"
      />
    </svg>
  )
}

export default FreeBSDResponsiveIcon
