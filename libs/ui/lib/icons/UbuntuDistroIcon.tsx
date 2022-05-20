import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const UbuntuDistroIcon = ({
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
    <g id="distro/ubuntu">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.00015 14.9999C11.8663 14.9999 15 11.8659 15 7.9998C15 4.13388 11.8663 1 8.00015 1C4.13408 1 1 4.13393 1 7.9998C1 11.8659 4.13403 14.9999 8.00015 14.9999ZM3.4668 8.89991C3.9642 8.89991 4.36716 8.49684 4.36716 7.99979C4.36716 7.50294 3.9642 7.09998 3.4668 7.09998C2.97 7.09998 2.56703 7.50294 2.56703 7.99979C2.56703 8.49689 2.97 8.89991 3.4668 8.89991ZM10.7168 12.7054C10.2863 12.9536 9.73609 12.8061 9.48752 12.376C9.23899 11.9455 9.38647 11.3953 9.81694 11.1468C10.2474 10.8982 10.7976 11.0454 11.0461 11.4758C11.2947 11.9063 11.1472 12.4568 10.7168 12.7054ZM10.7167 3.29485C11.1474 3.54313 11.2946 4.09347 11.0461 4.52399C10.7979 4.95442 10.2474 5.1019 9.81689 4.85337C9.38642 4.60485 9.23894 4.05455 9.48747 3.62413C9.73609 3.1938 10.2865 3.04633 10.7167 3.29485ZM10.5566 7.77265C10.4417 6.46138 9.34123 5.43339 8.00017 5.43339C7.61404 5.43339 7.24723 5.51908 6.91879 5.6717L6.28504 4.53363C6.80204 4.27745 7.38424 4.13343 8.00017 4.13343C8.35132 4.13343 8.69181 4.1805 9.0155 4.26841C9.07255 4.63408 9.28823 4.97161 9.63356 5.17099C9.97864 5.37037 10.3786 5.38845 10.7234 5.25545C11.3746 5.90155 11.7972 6.77781 11.8591 7.75211L10.5566 7.77265ZM6.52482 5.89977C5.86483 6.36398 5.43347 7.13168 5.43347 7.99979C5.43347 8.8685 5.86483 9.6359 6.52482 10.1005L5.85609 11.2183C5.08147 10.7007 4.50446 9.91164 4.26102 8.98654C4.54906 8.75451 4.73368 8.39891 4.73368 7.99984C4.73368 7.60103 4.54911 7.24543 4.26102 7.01345C4.50446 6.08829 5.08147 5.2992 5.85609 4.7819L6.52482 5.89977ZM6.91879 10.3281C7.24728 10.481 7.61409 10.5667 8.00017 10.5667C9.34123 10.5667 10.4416 9.53846 10.5566 8.22753L11.8591 8.24773C11.7972 9.22202 11.3747 10.0983 10.7234 10.7447C10.3786 10.6117 9.97864 10.6298 9.63356 10.8292C9.28818 11.0282 9.0725 11.3658 9.0155 11.7317C8.69181 11.8197 8.35127 11.8665 8.00017 11.8665C7.38419 11.8665 6.80204 11.7226 6.28504 11.4662L6.91879 10.3281Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default UbuntuDistroIcon
