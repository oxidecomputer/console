#! /usr/bin/env -S deno run --allow-run --allow-net
import { delay } from 'https://deno.land/std@0.181.0/async/delay.ts'
import { serve } from 'https://deno.land/std@0.181.0/http/server.ts'

/*
 * This exists because MSW does not support websockets. So in MSW mode, we also
 * run this little server and configure Vite to proxy WS requests to it.
 */

async function streamString(socket: WebSocket, s: string, delayMs = 50) {
  for (const c of s) {
    socket.send(new TextEncoder().encode(c))
    await delay(delayMs)
  }
}

async function serialConsole(req: Request) {
  await delay(500)
  const { socket, response } = Deno.upgradeWebSocket(req)
  console.log(`New client connected`)

  // send hello as a binary frame for xterm to display
  socket.onopen = () => {
    setTimeout(() => {
      streamString(socket, 'Wake up Neo...')
    }, 200)
  }

  // echo back binary data
  socket.onmessage = (m) => socket.send(m.data)

  socket.onclose = () => console.log('Connection closed')

  return response
}

serve(serialConsole, { port: 6036 })
