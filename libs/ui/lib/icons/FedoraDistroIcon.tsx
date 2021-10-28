import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function FedoraDistroIcon({
  title = 'Fedora',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M8.003 0C4.86-.042 1.829 1.976.638 4.879.048 6.18-.03 7.622.008 9.028c.006 1.778-.014 3.556.01 5.332.075 1.028 1.102 1.743 2.088 1.628 2.172-.013 4.344.029 6.514-.024 3.193-.202 6.104-2.53 7.018-5.593.934-2.896.02-6.275-2.26-8.295A7.979 7.979 0 008.003.001zm2.347 1.895c.27-.006.538.022.798.078.371.191.63.551.601.922-.038.5-.391.832-.919.831a1.968 1.968 0 00-.48-.06C9.2 3.631 8.238 4.74 8.37 5.87c.015.53-.03 1.067.021 1.594.222.305.658.12.983.17.185 0 .375.006.567.006a.09.09 0 00.028.006.86.86 0 01.861.863.86.86 0 01-.866.863.093.093 0 00-.04.009c-.518.002-1.036 0-1.554.001-.044 1.078.132 2.184-.206 3.227-.576 1.803-2.647 2.89-4.457 2.413-.358-.19-.606-.527-.578-.89.04-.53.437-.872 1.021-.826.05.004.075.008.112.013.477.093.985.023 1.405-.26.751-.43 1.001-1.319.93-2.129-.013-.458.03-.922-.021-1.377-.222-.304-.656-.12-.982-.17H5.06a.091.091 0 00-.043-.01.86.86 0 01-.866-.864c0-.48.383-.86.86-.863a.09.09 0 00.042-.011h1.545c.039-1.005-.106-2.03.142-3.016.432-1.584 1.967-2.746 3.61-2.724zm.47.035l.087.016-.087-.016zm.816.187a3.9 3.9 0 012.167 2.08 54.037 54.037 0 01-1.936-1.728 1.176 1.176 0 00-.23-.352h-.001zm.3.623a57.922 57.922 0 001.978 1.73c-.01-.029-.022-.057-.033-.086.11.299.177.612.2.935-.772-.64-1.525-1.3-2.26-1.984l.01-.022a1.124 1.124 0 00.107-.535c0-.013-.001-.025-.003-.038h.001zm.013.13c-.038.345-.038.345 0 0zm-.209.597c.766.701 1.55 1.381 2.354 2.04 0 .047.01.093.008.14.002.182-.011.363-.04.543a52.355 52.355 0 01-2.721-2.39c.16-.075.297-.19.4-.333h-.001zm.35 1.22a55.299 55.299 0 001.946 1.657 3.47 3.47 0 01-.161.575 49.3 49.3 0 01-1.538-1.309l.001.037c0 .05-.003.101-.007.15.47.409.96.825 1.494 1.257a3.754 3.754 0 01-.253.502c-.465-.381-.923-.77-1.374-1.168a2.086 2.086 0 00-.107-1.7v-.001zm.046 1.839c.43.373.88.754 1.362 1.146-.1.153-.212.298-.333.434-.45-.37-.891-.75-1.327-1.136.123-.134.221-.284.298-.444zm-.402.544c.44.387.885.767 1.337 1.14a4.013 4.013 0 01-.405.37c-.46-.385-.915-.779-1.362-1.18.135-.072.264-.164.381-.283.018-.015.032-.031.049-.047zm-.573.396c.457.407.921.807 1.392 1.199-.154.113-.32.208-.49.297a52.713 52.713 0 01-1.504-1.337c-.016.001-.033 0-.05.002l-.016-.01c.229-.017.454-.068.668-.151zm-6.698.165l-.014.01h-.008l.003.002c-.14.093-.258.219-.34.367l-.3-.285c.215-.05.437-.084.66-.093V7.63zm-.662.093l-.085.022.085-.021zm-.18.05l.414.395c-.079.226-.077.472.006.697-.312-.296-.627-.596-.955-.9a3.91 3.91 0 01.535-.192zm-.686.267c.48.45.949.898 1.422 1.353a1.787 1.787 0 00-.551.162c-.427-.408-.867-.82-1.332-1.244.147-.101.302-.19.46-.27V8.04zm8.014.136c.315.28.638.564.982.857-.194.094-.397.17-.605.228l-.411-.332c.105-.238.117-.507.033-.754zm-8.601.23c.443.41.877.819 1.305 1.23a2.105 2.105 0 00-1.018 1.554c-.477-.449-.96-.89-1.45-1.325a3.71 3.71 0 00-.061.146c.518.466 1.015.928 1.501 1.392.002.189.028.38.094.565.035.127.086.244.146.355A71.384 71.384 0 00.96 10.568c.017-.072.027-.144.049-.215.091-.345.244-.665.433-.96.46.414.9.827 1.335 1.24.021-.053.045-.104.071-.155-.436-.41-.877-.814-1.324-1.212.1-.143.207-.28.327-.41.441.402.864.802 1.284 1.203.036-.04.073-.081.112-.119a65.43 65.43 0 00-1.294-1.193 3.88 3.88 0 01.395-.34zm8.48.102l-.019.177.018-.177zm1.155.503l-.034.015.033-.015zm-1.147.06l.293.236c-.191.04-.388.064-.586.069h-.011a1.04 1.04 0 00.305-.305h-.001zM.924 10.734c.88.792 1.688 1.571 2.52 2.372l.117.111a1.038 1.038 0 00-.396.31 83.76 83.76 0 00-2.299-2.143 3.45 3.45 0 01.058-.65zm-.047.86c.742.68 1.474 1.372 2.196 2.074-.072.133-.12.284-.132.45a.938.938 0 000 .111 95.47 95.47 0 00-1.92-1.807 3.767 3.767 0 01-.145-.828h.001zm.252 1.142c.629.584 1.235 1.166 1.852 1.76l.014.014c.047.13.124.248.218.354-.964-.373-1.709-1.178-2.084-2.128zm2.235.176c.12.094.25.174.387.24l-.017.002-.012-.01a2.01 2.01 0 01-.358-.232zm.698 2.168l.1.017-.1-.017zm.152.027z"
        fill="#fff"
      />
    </svg>
  )
}

export default FedoraDistroIcon
