import { serveDir, serveFile } from 'https://deno.land/std@0.193.0/http/file_server.ts'
import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'

function handle(req: Request) {
  const { pathname } = new URL(req.url)
  const isAsset = pathname.startsWith('/assets/') || pathname === '/mockServiceWorker.js'
  // imitate dev server behavior — serve index.html for all non-asset requests
  return isAsset ? serveDir(req) : serveFile(req, './index.html')
}

serve(handle, { port: 4507, hostname: '0.0.0.0' })
