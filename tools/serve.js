/** A static server for local checks. Nothing clever; it just resolves /path/ to /path/index.html. */
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const DIST = path.resolve(import.meta.dirname, '..', 'dist')
const PORT = Number(process.env.PORT || 4321)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json'
}

createServer(async (req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  let file = path.join(DIST, url)
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html')
  } catch {
    if (!path.extname(file)) file = path.join(DIST, url, 'index.html')
  }
  try {
    const body = await readFile(file)
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    const body = await readFile(path.join(DIST, '404.html')).catch(() => 'Not found')
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' })
    res.end(body)
  }
}).listen(PORT, () => console.log(`serving dist/ on http://localhost:${PORT}`))
