#! /usr/bin/env -S deno run --watch --allow-run --allow-net
import { delay } from 'https://deno.land/std@0.181.0/async/delay.ts'
import { serve } from 'https://deno.land/std@0.181.0/http/server.ts'

/*
 * This exists because MSW does not support websockets. So in MSW mode, we also
 * run this little server and configure Vite to proxy WS requests to it.
 */

const enc = new TextEncoder()

async function streamString(socket: WebSocket, s: string, delayMs = 50) {
  for (const c of s) {
    socket.send(enc.encode(c))
    await delay(delayMs)
  }
}

// ANSI escape codes
const RESET_FMT = '\x1b[0m' // reset all formatting
const SET_GREEN = '\x1b[32m' // setting the foreground color to green
const CURSOR_HOME = '\x1b[1G' // move cursor to the beginning of the line

function generateProgressBar(progress: number) {
  const width = 30
  const filledWidth = Math.floor(progress * width)
  const emptyWidth = width - filledWidth

  const filledPart = SET_GREEN + '#'.repeat(filledWidth) + RESET_FMT
  const emptyPart = '-'.repeat(emptyWidth)
  const percentage = Math.floor(progress * 100)

  return `[${filledPart}${emptyPart}] ${percentage}%`
}

async function displayProgressBar(socket: WebSocket) {
  for (let progress = 0; progress <= 1; progress += 0.02) {
    if (socket.readyState !== WebSocket.OPEN) return

    const progressBar = generateProgressBar(progress)
    socket.send(enc.encode(CURSOR_HOME + progressBar))
    await delay(100)
  }
}

async function serialConsole(req: Request) {
  await delay(500)
  const { socket, response } = Deno.upgradeWebSocket(req)
  socket.binaryType = 'arraybuffer'

  console.log(`New client connected`)

  // send hello as a binary frame for xterm to display
  socket.onopen = async () => {
    await delay(200)
    await streamString(socket, 'Wake up Neo...\n')
    await displayProgressBar(socket)
    await streamString(socket, '\n' + CURSOR_HOME + 'Done!\n' + CURSOR_HOME)
  }

  // echo back binary data
  socket.onmessage = (m) => socket.send(m.data)

  socket.onclose = () => console.log('Connection closed')

  return response
}

serve(serialConsole, { port: 6036 })
