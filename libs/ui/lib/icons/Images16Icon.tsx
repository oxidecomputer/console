import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Images16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/images">
      <g id="Subtract">
        <path
          d="M1.52272 5.31201C1.27527 5.20596 1 5.38747 1 5.65669V11.4648C1 11.7634 1.17712 12.0335 1.45096 12.1526L6.47548 14.3372C6.72314 14.4448 7 14.2633 7 13.9933V8.15396C7 7.85394 6.8212 7.58279 6.54544 7.4646L1.52272 5.31201Z"
          fill="currentColor"
        />
        <path
          d="M9 13.9933C9 14.2633 9.27685 14.4448 9.52452 14.3372L14.549 12.1526C14.8229 12.0335 15 11.7634 15 11.4648V5.65669C15 5.38747 14.7247 5.20596 14.4773 5.31201L9.45456 7.4646C9.1788 7.58279 9 7.85394 9 8.15396V13.9933Z"
          fill="currentColor"
        />
        <path
          d="M12.891 3.8159C13.1932 3.68639 13.1943 3.2584 12.8928 3.12732L8.29904 1.13002C8.10831 1.04709 7.89169 1.04709 7.70096 1.13002L3.10717 3.12732C2.80568 3.2584 2.8068 3.68639 3.10898 3.8159L7.70456 5.78543C7.89322 5.86629 8.10678 5.86629 8.29544 5.78543L12.891 3.8159Z"
          fill="currentColor"
        />
      </g>
    </g>
  </svg>
)
export default Images16Icon
