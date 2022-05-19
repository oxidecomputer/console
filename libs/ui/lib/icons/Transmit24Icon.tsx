import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Transmit24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/transmit">
      <path
        id="Icon"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.51501 15.8612L3.1541 17.1087C1.19543 14.9731 0 12.1262 0 8.99998C0 5.8738 1.19543 3.02683 3.1541 0.891243L4.515 2.13874C2.85767 3.94577 1.84615 6.35475 1.84615 8.99998C1.84615 11.6452 2.85767 14.0542 4.51501 15.8612ZM16.7632 4.63375L18.1241 3.38625C19.4801 4.86473 20.3077 6.83571 20.3077 8.99998C20.3077 11.1643 19.4801 13.1352 18.1241 14.6137L16.7632 13.3662C17.8178 12.2163 18.4615 10.6833 18.4615 8.99998C18.4615 7.31666 17.8179 5.78368 16.7632 4.63375ZM22.1538 8.99998C22.1538 6.35476 21.1423 3.94578 19.485 2.13875L20.8459 0.891257C22.8046 3.02684 24 5.87381 24 8.99998C24 12.1262 22.8046 14.9731 20.8459 17.1087L19.485 15.8612C21.1423 14.0542 22.1538 11.6452 22.1538 8.99998ZM5.87592 14.6137L7.23683 13.3662C6.18216 12.2163 5.53846 10.6833 5.53846 8.99998C5.53846 7.31666 6.18215 5.78367 7.23682 4.63374L5.87591 3.38624C4.51991 4.86472 3.69231 6.8357 3.69231 8.99998C3.69231 11.1643 4.51991 13.1353 5.87592 14.6137ZM16 9C16 10.6699 14.9767 12.1008 13.523 12.6998L17 24H7L10.477 12.6998C9.02327 12.1008 8 10.6699 8 9C8 6.79086 9.79086 5 12 5C14.2091 5 16 6.79086 16 9Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Transmit24Icon
