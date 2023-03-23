import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Close12Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={17}
    height={17}
    viewBox="0 0 17 17"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/close">
      <g id="12/add">
        <path
          id="Union"
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.8088 5.2537C13.0697 4.99277 13.0697 4.56972 12.8088 4.30879L12.6912 4.1912C12.4303 3.93027 12.0072 3.93027 11.7463 4.1912L8.49999 7.43749L5.2537 4.1912C4.99277 3.93027 4.56972 3.93027 4.30879 4.1912L4.1912 4.30879C3.93027 4.56972 3.93027 4.99277 4.1912 5.2537L7.43749 8.49999L4.1912 11.7463C3.93027 12.0072 3.93027 12.4303 4.1912 12.6912L4.30879 12.8088C4.56972 13.0697 4.99277 13.0697 5.2537 12.8088L8.49999 9.56249L11.7463 12.8088C12.0072 13.0697 12.4303 13.0697 12.6912 12.8088L12.8088 12.6912C13.0697 12.4303 13.0697 12.0072 12.8088 11.7463L9.56249 8.49999L12.8088 5.2537Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)
export default Close12Icon
