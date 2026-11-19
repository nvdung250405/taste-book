import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'

const root = resolve('dist')
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
}
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405)
      response.end()
      return
    }
    const pathname = decodeURIComponent(
      new URL(request.url, 'http://localhost').pathname,
    )
    let file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`)
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403)
      response.end()
      return
    }
    try {
      if (!(await stat(file)).isFile()) throw new Error('Not a file')
    } catch {
      if (
        extname(pathname) ||
        pathname.startsWith('/api/') ||
        !request.headers.accept?.includes('text/html')
      ) {
        response.writeHead(404)
        response.end()
        return
      }
      file = resolve(root, 'index.html')
    }
    const type = types[extname(file)] || 'application/octet-stream'
    const encodings = (request.headers['accept-encoding'] || '')
      .split(',')
      .map((value) => {
        const [name, weight] = value.trim().split(';')
        return {
          name,
          quality: weight?.trim().startsWith('q=')
            ? Number(weight.trim().slice(2))
            : 1,
        }
      })
      .filter((value) => value.quality > 0)
      .sort((a, b) => b.quality - a.quality || (a.name === 'br' ? -1 : 1))
    let payload
    for (const { name } of encodings) {
      if (!['br', 'gzip'].includes(name)) continue
      try {
        payload = await readFile(file + (name === 'br' ? '.br' : '.gz'))
        response.setHeader('Content-Encoding', name)
        break
      } catch {
        /* Original file remains available. */
      }
    }
    payload ??= await readFile(file)
    response.setHeader('Content-Type', type)
    response.setHeader('Vary', 'Accept-Encoding')
    response.setHeader(
      'Cache-Control',
      file.includes(sep + 'assets' + sep)
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
    )
    response.setHeader('Content-Length', payload.length)
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.writeHead(200)
    response.end(request.method === 'HEAD' ? undefined : payload)
  } catch {
    response.writeHead(500)
    response.end('Could not serve production build')
  }
})
const port = Number(process.env.PORT || 4173)
server.listen(port, '127.0.0.1', () =>
  console.log(`Production preview with Gzip/Brotli: http://127.0.0.1:${port}`),
)
