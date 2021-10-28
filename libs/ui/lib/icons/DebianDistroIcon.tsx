import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function DebianDistroIcon({
  title = 'Debian',
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
        d="M9.768 8.457c-.27 0 .054.133.404.187.095-.067.182-.147.263-.22-.219.047-.444.058-.667.033zm1.443-.354c.155-.22.27-.46.316-.707-.04.18-.134.334-.222.487-.506.314-.047-.18 0-.373-.54.673-.074.4-.094.593zm.525-1.367c.034-.48-.094-.333-.134-.147.047.027.087.334.134.147zM8.756.206c.135.027.304.047.283.08.156-.033.19-.066-.29-.08h.007zm.283.08l-.1.02L9.032.3V.287h.006zm4.464 6.63c.014.427-.135.634-.256 1l-.236.12c-.189.36.02.234-.115.52-.296.261-.903.815-1.092.868-.135 0 .094-.167.128-.227-.398.267-.324.4-.924.567l-.02-.04c-1.497.694-3.574-.68-3.54-2.561-.02.113-.047.087-.08.133a2.347 2.347 0 01.306-1.374c.24-.417.604-.752 1.042-.96a2.287 2.287 0 012.515.32 2.273 2.273 0 00-1.834-.867c-.796.007-1.538.507-1.787 1.047-.405.254-.452.98-.627 1.107-.243 1.734.445 2.481 1.605 3.362.182.127.054.14.08.233a3.165 3.165 0 01-1.031-.773c.155.22.317.44.54.607-.371-.12-.857-.868-.999-.9.628 1.106 2.55 1.947 3.547 1.533a4.225 4.225 0 01-1.57-.187c-.223-.106-.52-.34-.473-.38a3.95 3.95 0 003.978-.56c.297-.233.627-.627.722-.634-.135.214.027.107-.081.294.296-.48-.135-.2.31-.827l.162.22c-.06-.4.499-.88.445-1.507.128-.2.135.2 0 .647.195-.494.054-.567.101-.974.054.133.121.28.155.42-.121-.467.135-.8.189-1.067-.06-.033-.189.2-.216-.354 0-.246.068-.133.095-.186-.054-.034-.176-.214-.257-.574.054-.087.149.22.23.227-.054-.28-.135-.5-.135-.72-.23-.454-.081.066-.27-.2-.23-.728.202-.167.23-.494.363.513.566 1.307.66 1.64-.067-.4-.189-.8-.33-1.173.107.046-.176-.827.141-.247a5.23 5.23 0 00-2.468-2.928c.122.113.284.26.223.28-.506-.3-.418-.32-.492-.447-.412-.166-.439.014-.715 0-.782-.413-.93-.366-1.645-.633l.033.153c-.519-.167-.606.067-1.166 0-.034-.027.182-.093.357-.12-.499.067-.472-.093-.964.02.115-.087.243-.14.371-.213-.405.026-.971.233-.796.046-.667.3-1.847.714-2.508 1.328l-.02-.147c-.304.36-1.322 1.074-1.403 1.54l-.087.02c-.155.267-.257.567-.385.84-.202.348-.303.134-.27.188-.404.813-.606 1.5-.782 2.067.122.18 0 1.1.048 1.84-.203 3.642 2.589 7.184 5.637 8.004.451.154 1.112.154 1.678.167-.667-.187-.755-.1-1.402-.327-.472-.213-.573-.467-.903-.753l.134.233c-.654-.227-.384-.28-.917-.447l.142-.18c-.21-.02-.56-.353-.654-.54l-.23.006c-.276-.333-.424-.58-.41-.773l-.075.133c-.087-.14-1.025-1.267-.54-1.007-.087-.08-.208-.133-.336-.367l.094-.113c-.236-.293-.432-.68-.418-.8.135.16.216.2.303.22-.593-1.448-.627-.08-1.078-1.468l.1-.013c-.067-.107-.12-.227-.175-.34l.04-.4c-.424-.494-.12-2.068-.06-2.935.047-.36.358-.733.594-1.32l-.142-.027c.27-.474 1.578-1.914 2.185-1.84.29-.368-.061 0-.122-.094.647-.66.85-.467 1.281-.587.472-.267-.404.107-.182-.1.81-.2.573-.467 1.632-.567.108.067-.263.093-.35.173.674-.326 2.123-.246 3.074.18 1.1.514 2.333 2.008 2.38 3.422l.054.013c-.027.567.088 1.214-.115 1.808l.135-.28.007.006zM6.841 8.824l-.033.186c.175.234.317.487.539.674-.162-.313-.283-.44-.506-.867v.007zm.418-.02c-.094-.1-.148-.227-.209-.347.054.213.176.4.29.587l-.08-.24zm7.377-1.588l-.047.1a4.64 4.64 0 01-.466 1.474c.27-.487.439-1.027.506-1.574h.007zM8.803.08c.183-.067.445-.033.641-.08-.25.02-.499.033-.742.067l.101.013zM2.438 3.428c.048.38-.29.534.075.28.202-.44-.075-.12-.068-.28h-.007zm-.424 1.774c.08-.26.1-.413.134-.56-.236.293-.114.353-.134.553"
        fill="currentColor"
      />
    </svg>
  )
}

export default DebianDistroIcon
