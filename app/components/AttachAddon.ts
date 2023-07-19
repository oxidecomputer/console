/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/**
 * Copyright (c) 2014, 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Implements the attach method, that attaches the terminal to a WebSocket stream.
 *
 * Original: https://github.com/xtermjs/xterm.js/blob/2fdb4691/addons/xterm-addon-attach/src/AttachAddon.ts
 */
import type { IDisposable, ITerminalAddon, Terminal } from 'xterm'

export class AttachAddon implements ITerminalAddon {
  private _socket: WebSocket
  private _disposables: IDisposable[] = []

  constructor(socket: WebSocket) {
    this._socket = socket
    // always set binary type to arraybuffer, we do not handle blobs
    this._socket.binaryType = 'arraybuffer'
  }

  public activate(terminal: Terminal): void {
    this._disposables.push(
      addSocketListener(this._socket, 'message', (ev) => {
        const data: ArrayBuffer | string = ev.data
        terminal.write(typeof data === 'string' ? data : new Uint8Array(data))
      })
    )

    // Forked to change this line from _sendData to _sendBinary
    this._disposables.push(terminal.onData((data) => this._sendBinary(data)))
    this._disposables.push(terminal.onBinary((data) => this._sendBinary(data)))

    this._disposables.push(addSocketListener(this._socket, 'close', () => this.dispose()))
    this._disposables.push(addSocketListener(this._socket, 'error', () => this.dispose()))
  }

  public dispose(): void {
    for (const d of this._disposables) {
      d.dispose()
    }
  }

  private _sendBinary(data: string): void {
    if (!this._checkOpenSocket()) {
      return
    }
    const buffer = new Uint8Array(data.length)
    for (let i = 0; i < data.length; ++i) {
      buffer[i] = data.charCodeAt(i) & 255
    }
    this._socket.send(buffer)
  }

  private _checkOpenSocket(): boolean {
    switch (this._socket.readyState) {
      case WebSocket.OPEN:
        return true
      case WebSocket.CONNECTING:
        throw new Error('Attach addon was loaded before socket was open')
      case WebSocket.CLOSING:
        console.warn('Attach addon socket is closing')
        return false
      case WebSocket.CLOSED:
        throw new Error('Attach addon socket is closed')
      default:
        throw new Error('Unexpected socket state')
    }
  }
}

function addSocketListener<K extends keyof WebSocketEventMap>(
  socket: WebSocket,
  type: K,
  handler: (this: WebSocket, ev: WebSocketEventMap[K]) => void
): IDisposable {
  socket.addEventListener(type, handler)
  return {
    dispose: () => {
      if (!handler) return // Already disposed
      socket.removeEventListener(type, handler)
    },
  }
}
